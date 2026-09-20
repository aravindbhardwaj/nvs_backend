import {
  ExecutionContext,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EffectivePermissionsService } from '../auth/services/effective-permissions.service';
import { REQUIRED_PERMISSIONS_KEY } from '../auth/decorators/require-permission.decorator';
import { MediaTypesController } from './media-types.controller';
import { MediaTypesService } from './media-types.service';

const uuid = '550e8400-e29b-41d4-a716-446655440000';
const operations = [
  ['get', '', 'findOne', 'findOneByUuid'],
  ['post', '/update', 'update', 'updateByUuid'],
  ['post', '/delete', 'remove', 'removeByUuid'],
  ['post', '/restore', 'restore', 'restoreByUuid'],
] as const;

describe('Media type UUID HTTP routes', () => {
  let app: INestApplication;
  const result = { id: 12, uuid };
  const service = {
    resolveUuid: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [MediaTypesController],
      providers: [
        { provide: MediaTypesService, useValue: service },
        {
          provide: EffectivePermissionsService,
          useValue: { resolve: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest();
          if (!req.headers.authorization) throw new UnauthorizedException();
          req.user = {
            id: 1,
            role:
              req.headers.authorization === 'admin'
                ? Role.SUPER_ADMIN
                : Role.JNV,
          };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await app?.close();
  });
  beforeEach(() => {
    jest.resetAllMocks();
    service.resolveUuid.mockResolvedValue(12);
    for (const method of ['findOne', 'update', 'remove', 'restore'] as const)
      service[method].mockResolvedValue(result);
  });

  it.each(operations)(
    '%s UUID route preserves numeric response and operation',
    async (verb, suffix, method, uuidMethod) => {
      const numeric = await request(app.getHttpServer())
        [verb](`/api/media-types/12${suffix}`)
        .set('Authorization', 'admin')
        .send({})
        .expect(200);
      expect(service.resolveUuid).not.toHaveBeenCalled();
      const byUuid = await request(app.getHttpServer())
        [verb](`/api/media-types/uuid/${uuid}${suffix}`)
        .set('Authorization', 'admin')
        .send({})
        .expect(200);
      expect(byUuid.body).toEqual(numeric.body);
      expect(service.resolveUuid).toHaveBeenCalledWith(uuid);
      expect(service[method].mock.calls.at(-1)?.[0]).toBe(12);
      expect(
        Reflect.getMetadata(
          REQUIRED_PERMISSIONS_KEY,
          MediaTypesController.prototype[uuidMethod],
        ),
      ).toEqual(
        Reflect.getMetadata(
          REQUIRED_PERMISSIONS_KEY,
          MediaTypesController.prototype[method],
        ),
      );
    },
  );

  it.each(operations)(
    '%s rejects malformed, missing and unauthorized UUID requests',
    async (verb, suffix) => {
      const base = '/api/media-types/uuid/';
      await request(app.getHttpServer())
        [verb](`${base}invalid${suffix}`)
        .set('Authorization', 'admin')
        .expect(400);
      await request(app.getHttpServer())
        [verb](`${base}${uuid}${suffix}`)
        .expect(401);
      await request(app.getHttpServer())
        [verb](`${base}${uuid}${suffix}`)
        .set('Authorization', 'jnv')
        .expect(403);
      expect(service.resolveUuid).not.toHaveBeenCalled();
      service.resolveUuid.mockRejectedValue(
        new NotFoundException('Media type not found.'),
      );
      await request(app.getHttpServer())
        [verb](`${base}${uuid}${suffix}`)
        .set('Authorization', 'admin')
        .expect(404);
    },
  );
});
