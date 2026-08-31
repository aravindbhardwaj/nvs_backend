import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './services/password.service';
import { RefreshTokenService } from './services/refresh-token.service';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: PasswordService, useValue: {} },
        { provide: RefreshTokenService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login identifier lookup', () => {
    const user = {
      id: 1,
      email: 'user@nvs.gov.in',
      username: 'nvs-user',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('preserves email lookup behavior', async () => {
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(
        (service as unknown as { findUserByIdentifier(value: string): unknown })
          .findUserByIdentifier('user@nvs.gov.in'),
      ).resolves.toBe(user);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@nvs.gov.in' },
        include: { organizationType: { select: { code: true } } },
      });
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('falls back to a case-insensitive username lookup', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue(user);

      await expect(
        (service as unknown as { findUserByIdentifier(value: string): unknown })
          .findUserByIdentifier('nvs-user'),
      ).resolves.toBe(user);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          username: { equals: 'nvs-user', mode: 'insensitive' },
        },
        include: { organizationType: { select: { code: true } } },
      });
    });
  });
});
