import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationOwnershipGuard } from '../auth/guards/organization-ownership.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PublicMediaController } from './public-media.controller';

describe('Media archival API integration', () => {
  const mediaUuid = '11111111-1111-4111-8111-111111111111';
  const user = {
    id: 7,
    email: 'admin@nvs.gov.in',
    role: Role.SUPER_ADMIN,
    organizationId: 1,
  };
  const mediaService = {
    archiveByUuid: jest.fn(),
    restoreArchivedByUuid: jest.fn(),
    findPublic: jest.fn(),
  };
  let app: INestApplication;

  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const module = await Test.createTestingModule({
      controllers: [MediaController, PublicMediaController],
      providers: [{ provide: MediaService, useValue: mediaService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(allow)
      .overrideGuard(RolesGuard)
      .useValue(allow)
      .overrideGuard(PermissionsGuard)
      .useValue(allow)
      .overrideGuard(OrganizationOwnershipGuard)
      .useValue(allow)
      .compile();

    app = module.createNestApplication();
    app.use((req, _res, next) => {
      req.user = user;
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => app.close());

  beforeEach(() => {
    jest.clearAllMocks();
    mediaService.archiveByUuid.mockResolvedValue({
      uuid: mediaUuid,
      is_archived: true,
    });
    mediaService.restoreArchivedByUuid.mockResolvedValue({
      uuid: mediaUuid,
      is_archived: false,
    });
    mediaService.findPublic.mockResolvedValue({
      items: [],
      meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
    });
  });

  it('archives media through the new UUID endpoint', async () => {
    await request(app.getHttpServer())
      .post(`/api/media/uuid/${mediaUuid}/archive`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toBe('Media archived successfully.');
        expect(body.data.is_archived).toBe(true);
      });

    expect(mediaService.archiveByUuid).toHaveBeenCalledWith(mediaUuid, user);
  });

  it('restores archival status without using the existing delete-restore route', async () => {
    await request(app.getHttpServer())
      .post(`/api/media/uuid/${mediaUuid}/archive/restore`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.is_archived).toBe(false);
      });

    expect(mediaService.restoreArchivedByUuid).toHaveBeenCalledWith(
      mediaUuid,
      user,
    );
  });

  it('transforms is_archived=true on the existing public API', async () => {
    await request(app.getHttpServer())
      .get('/api/public/media?is_archived=true&page=1&limit=20')
      .expect(200);

    expect(mediaService.findPublic).toHaveBeenCalledWith(
      expect.objectContaining({ is_archived: true, page: 1, limit: 20 }),
    );
  });

  it('preserves active-media behavior when is_archived is omitted', async () => {
    await request(app.getHttpServer())
      .get('/api/public/media?page=1&limit=20')
      .expect(200);

    expect(mediaService.findPublic).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 20 }),
    );
    expect(
      mediaService.findPublic.mock.calls[0][0].is_archived,
    ).toBeUndefined();
  });

  it('rejects invalid is_archived values', async () => {
    await request(app.getHttpServer())
      .get('/api/public/media?is_archived=not-a-boolean')
      .expect(400);

    expect(mediaService.findPublic).not.toHaveBeenCalled();
  });
});
