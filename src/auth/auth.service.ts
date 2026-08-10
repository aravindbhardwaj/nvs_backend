import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { RefreshToken, User, UserStatus } from '@prisma/client';

import { randomBytes } from 'crypto';

import { TokenPair } from './interfaces/token-pair.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

import { PasswordService } from './services/password.service';

import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}
  private async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  private async ensureUserCanLogin(user: User): Promise<void> {
    if (user.deletedAt || user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active.');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked.');
    }
  }

  private async increaseFailedAttempts(user: User): Promise<void> {
    const maxAttempts = this.configService.getOrThrow<number>(
      'auth.login.maxAttempts',
    );

    const lockMinutes = this.configService.getOrThrow<number>(
      'auth.login.lockMinutes',
    );

    const attempts = user.failedLoginAttempts + 1;

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil:
          attempts >= maxAttempts
            ? new Date(Date.now() + lockMinutes * 60 * 1000)
            : null,
      },
    });
  }

  private async resetFailedAttempts(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  }

  private buildJwtPayload(user: User): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private generateRefreshTokenSecret(): string {
    return randomBytes(64).toString('hex');
  }

  private async createRefreshToken(userId: number): Promise<string> {
    const secret = this.generateRefreshTokenSecret();
    const tokenHash = await this.passwordService.hashSecret(secret);

    const expiresAt = new Date(Date.now() + this.getRefreshTokenTtlMs());

    const storedToken = await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return `${storedToken.id}.${secret}`;
  }

  private parseRefreshToken(
    refreshToken: string,
  ): { id: number; secret: string } | null {
    const [idValue, secret, ...rest] = refreshToken.split('.');
    const id = Number(idValue);

    if (rest.length > 0 || !Number.isSafeInteger(id) || id < 1 || !secret) {
      return null;
    }

    return { id, secret };
  }

  private getRefreshTokenTtlMs(): number {
    const expiresIn = this.configService.getOrThrow<string>(
      'jwt.refreshExpiresIn',
    );
    const match = /^(\d+)([smhd])$/.exec(expiresIn);

    if (!match) {
      throw new Error('JWT_REFRESH_EXPIRES_IN must use s, m, h, or d units.');
    }

    const [, amount, unit] = match;
    const multiplier = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    }[unit as 's' | 'm' | 'h' | 'd'];

    return Number(amount) * multiplier;
  }

  private getAccessTokenTtlSeconds(): number {
    const expiresIn = this.configService.getOrThrow<string>(
      'jwt.accessExpiresIn',
    );
    const match = /^(\d+)([smhd])$/.exec(expiresIn);

    if (!match) {
      throw new Error('JWT_ACCESS_EXPIRES_IN must use s, m, h, or d units.');
    }

    const [, amount, unit] = match;
    const multiplier = { s: 1, m: 60, h: 60 * 60, d: 24 * 60 * 60 }[
      unit as 's' | 'm' | 'h' | 'd'
    ];

    return Number(amount) * multiplier;
  }

  private async findRefreshToken(id: number): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: {
        id,
      },
    });
  }

  private async revokeRefreshToken(id: number): Promise<void> {
    await this.prisma.refreshToken.update({
      where: {
        id,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  private async revokeAllRefreshTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  private async findUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.findUserByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    await this.ensureUserCanLogin(user);

    const valid = await this.passwordService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!valid) {
      await this.increaseFailedAttempts(user);

      throw new UnauthorizedException('Invalid email or password.');
    }

    await this.resetFailedAttempts(user.id);

    const payload = this.buildJwtPayload(user);

    const accessToken = await this.generateAccessToken(payload);

    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.getAccessTokenTtlSeconds(),
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const parsedToken = this.parseRefreshToken(dto.refreshToken);

    if (!parsedToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const storedToken = await this.findRefreshToken(parsedToken.id);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token expired.');
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token revoked.');
    }

    const matches = await this.passwordService.compare(
      parsedToken.secret,
      storedToken.tokenHash,
    );

    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const user = await this.findUserById(storedToken.userId);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    await this.ensureUserCanLogin(user);

    const refreshToken = await this.prisma.$transaction(async (tx) => {
      const revoked = await tx.refreshToken.updateMany({
        where: { id: storedToken.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (revoked.count !== 1) {
        throw new UnauthorizedException('Refresh token has already been used.');
      }

      const secret = this.generateRefreshTokenSecret();
      const tokenHash = await this.passwordService.hashSecret(secret);
      const nextToken = await tx.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + this.getRefreshTokenTtlMs()),
        },
      });

      return `${nextToken.id}.${secret}`;
    });

    const accessToken = await this.generateAccessToken(
      this.buildJwtPayload(user),
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.getAccessTokenTtlSeconds(),
    };
  }

  async logout(user: AuthenticatedUser, refreshToken: string): Promise<void> {
    const parsedToken = this.parseRefreshToken(refreshToken);

    if (!parsedToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const storedToken = await this.findRefreshToken(parsedToken.id);

    if (
      !storedToken ||
      storedToken.userId !== user.id ||
      storedToken.revokedAt
    ) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const matches = await this.passwordService.compare(
      parsedToken.secret,
      storedToken.tokenHash,
    );

    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    await this.revokeRefreshToken(storedToken.id);
  }

  async changePassword(
    user: AuthenticatedUser,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const dbUser = await this.findUserById(user.id);

    if (!dbUser) {
      throw new UnauthorizedException('User not found.');
    }

    const valid = await this.passwordService.compare(
      dto.currentPassword,
      dbUser.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new ForbiddenException(
        'New password must be different from the current password.',
      );
    }

    await this.passwordService.validate(dto.newPassword);

    const passwordHash = await this.passwordService.hash(dto.newPassword);

    await this.prisma.user.update({
      where: {
        id: dbUser.id,
      },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        passwordResetRequired: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.revokeAllRefreshTokens(dbUser.id);
  }
}
