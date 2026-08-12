import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Prisma, User, UserStatus } from '@prisma/client';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenRefreshResponseDto } from './dto/token-refresh-response.dto';

import { PasswordService } from './services/password.service';
import { RefreshTokenService } from './services/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}
  private async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  private async ensureUserCanLogin(user: User): Promise<void> {
    if (user.isDeleted || user.deletedAt) {
      await this.createAuthenticationAuditLog(user.id, 'LOGIN_FAILED', {
        reason: 'USER_DELETED',
      });
      throw new ForbiddenException('User account has been deleted.');
    }

    if (user.status === UserStatus.INACTIVE) {
      await this.createAuthenticationAuditLog(user.id, 'LOGIN_FAILED', {
        reason: 'USER_INACTIVE',
      });
      throw new ForbiddenException('User account is inactive.');
    }

    if (user.status === UserStatus.LOCKED) {
      await this.createAuthenticationAuditLog(user.id, 'LOGIN_FAILED', {
        reason: 'ACCOUNT_LOCKED',
      });
      throw new ForbiddenException('Account is temporarily locked.');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.createAuthenticationAuditLog(user.id, 'LOGIN_FAILED', {
        reason: 'ACCOUNT_LOCKED',
      });
      throw new ForbiddenException('Account is temporarily locked.');
    }
  }

  private async recordFailedLogin(user: User): Promise<boolean> {
    const maxAttempts = this.configService.getOrThrow<number>(
      'auth.login.maxAttempts',
    );

    const lockMinutes = this.configService.getOrThrow<number>(
      'auth.login.lockMinutes',
    );

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } },
      });
      const isLocked = updatedUser.failedLoginAttempts >= maxAttempts;

      if (isLocked) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            lockedUntil: new Date(Date.now() + lockMinutes * 60 * 1000),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          module: 'AUTHENTICATION',
          entity: 'USER',
          entityId: user.id,
          action: 'LOGIN_FAILED',
          newValues: {
            failedLoginAttempts: updatedUser.failedLoginAttempts,
          },
        },
      });

      if (isLocked) {
        await tx.auditLog.create({
          data: {
            userId: user.id,
            module: 'AUTHENTICATION',
            entity: 'USER',
            entityId: user.id,
            action: 'ACCOUNT_LOCKED',
            newValues: { lockedUntil: true },
          },
        });
      }

      return isLocked;
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
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      sessionVersion: user.sessionVersion,
    };
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private async createAuthenticationAuditLog(
    userId: number,
    action: string,
    newValues?: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId,
        module: 'AUTHENTICATION',
        entity: 'USER',
        entityId: userId,
        action,
        newValues,
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
      const accountLocked = await this.recordFailedLogin(user);

      if (accountLocked) {
        throw new ForbiddenException('Account is temporarily locked.');
      }

      throw new UnauthorizedException('Invalid email or password.');
    }

    await this.resetFailedAttempts(user.id);

    const payload = this.buildJwtPayload(user);

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.refreshTokenService.issue(user.id);

    await this.createAuthenticationAuditLog(user.id, 'LOGIN_SUCCESS');

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<TokenRefreshResponseDto> {
    const validatedToken = await this.refreshTokenService.validate(
      dto.refreshToken,
    );
    await this.refreshTokenService.cleanupExpiredTokens();
    const accessToken = await this.generateAccessToken(
      this.buildJwtPayload(validatedToken.user),
    );
    const refreshToken = await this.refreshTokenService.rotate(validatedToken);

    return { accessToken, refreshToken };
  }

  async logout(dto: RefreshTokenDto, userId: number): Promise<void> {
    await this.refreshTokenService.revoke(dto.refreshToken, userId);
  }
}
