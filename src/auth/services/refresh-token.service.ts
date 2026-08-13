import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, RefreshToken, User, UserStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

import { ConfigService } from '@nestjs/config';

import { PasswordService } from './password.service';
import { RefreshTokenRepositoryService } from './refresh-token.repository.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface ValidatedRefreshToken {
  token: RefreshToken;
  user: User & { organizationType: { code: string } };
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly refreshTokenRepository: RefreshTokenRepositoryService,
  ) {}

  async issue(userId: number): Promise<string> {
    const refreshToken = randomBytes(48).toString('base64url');
    const tokenHash = await this.passwordService.hashSecret(refreshToken);

    await this.refreshTokenRepository.create({
      tokenHash,
      expiresAt: this.getExpiryDate(),
      user: { connect: { id: userId } },
    });

    return refreshToken;
  }

  async validate(refreshToken: string): Promise<ValidatedRefreshToken> {
    const records = await this.refreshTokenRepository.findAll();
    const record = await this.findMatchingToken(records, refreshToken);

    if (!record) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (record.revokedAt || record.expiresAt <= new Date()) {
      await this.createAuditLog(record.userId, 'REFRESH_TOKEN_INVALID', {
        reason: record.revokedAt ? 'TOKEN_REVOKED' : 'TOKEN_EXPIRED',
      });
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (!this.isUserActive(record.user)) {
      await this.createAuditLog(record.userId, 'REFRESH_TOKEN_INVALID', {
        reason: 'USER_NOT_ACTIVE',
      });
      throw new UnauthorizedException('User session is no longer valid.');
    }

    return { token: record, user: record.user };
  }

  async rotate(validatedToken: ValidatedRefreshToken): Promise<string> {
    const refreshToken = randomBytes(48).toString('base64url');
    const tokenHash = await this.passwordService.hashSecret(refreshToken);
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const revoked = await tx.refreshToken.updateMany({
        where: { id: validatedToken.token.id, revokedAt: null },
        data: { revokedAt: now },
      });

      if (revoked.count !== 1) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      await tx.refreshToken.create({
        data: {
          userId: validatedToken.user.id,
          tokenHash,
          expiresAt: this.getExpiryDate(),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: validatedToken.user.id,
          module: 'AUTHENTICATION',
          entity: 'REFRESH_TOKEN',
          entityId: validatedToken.token.id,
          action: 'REFRESH_TOKEN_REVOKED',
          newValues: { reason: 'TOKEN_ROTATION' },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: validatedToken.user.id,
          module: 'AUTHENTICATION',
          entity: 'REFRESH_TOKEN',
          action: 'TOKEN_REFRESHED',
          newValues: { previousTokenRevoked: true },
        },
      });
    });

    return refreshToken;
  }

  async revoke(refreshToken: string, userId: number): Promise<void> {
    const validatedToken = await this.validate(refreshToken);

    if (validatedToken.user.id !== userId) {
      await this.createAuditLog(userId, 'REFRESH_TOKEN_INVALID', {
        reason: 'TOKEN_USER_MISMATCH',
      });
      throw new UnauthorizedException('Invalid refresh token.');
    }

    await this.prisma.$transaction(async (tx) => {
      const revoked = await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (revoked.count < 1) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      await tx.user.update({
        where: { id: userId },
        data: { sessionVersion: { increment: 1 } },
      });

      await tx.auditLog.create({
        data: {
          userId,
          module: 'AUTHENTICATION',
          entity: 'REFRESH_TOKEN',
          entityId: validatedToken.token.id,
          action: 'REFRESH_TOKEN_REVOKED',
          newValues: {
            reason: 'LOGOUT_ALL_SESSIONS',
            revokedCount: revoked.count,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          module: 'AUTHENTICATION',
          entity: 'REFRESH_TOKEN',
          entityId: validatedToken.token.id,
          action: 'LOGOUT',
          newValues: {
            allRefreshTokensRevoked: true,
            revokedCount: revoked.count,
          },
        },
      });
    });
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.cleanupExpired(new Date());
  }

  private async findMatchingToken(
    records: (RefreshToken & { user: User & { organizationType: { code: string } } })[],
    refreshToken: string,
  ): Promise<(RefreshToken & { user: User & { organizationType: { code: string } } }) | undefined> {
    for (const record of records) {
      if (await this.passwordService.compare(refreshToken, record.tokenHash)) {
        return record;
      }
    }
  }

  private isUserActive(user: User): boolean {
    return (
      !user.isDeleted &&
      !user.deletedAt &&
      user.status === UserStatus.ACTIVE &&
      (!user.lockedUntil || user.lockedUntil <= new Date())
    );
  }

  private getExpiryDate(): Date {
    const value = this.configService.getOrThrow<string>('jwt.refreshExpiresIn');
    const match = /^(\d+)(s|m|h|d)$/.exec(value);

    if (!match) {
      throw new Error(
        'JWT_REFRESH_EXPIRES_IN must use a number followed by s, m, h, or d.',
      );
    }

    const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    const multiplier = multipliers[match[2] as keyof typeof multipliers];

    return new Date(Date.now() + Number(match[1]) * multiplier);
  }

  private async createAuditLog(
    userId: number,
    action: string,
    newValues?: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId,
        module: 'AUTHENTICATION',
        entity: 'REFRESH_TOKEN',
        action,
        newValues,
      },
    });
  }
}
