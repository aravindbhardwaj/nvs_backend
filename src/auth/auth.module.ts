import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './services/password.service';
import { EffectivePermissionsService } from './services/effective-permissions.service';
import { OrganizationOwnershipService } from './services/organization-ownership.service';
import { RefreshTokenRepositoryService } from './services/refresh-token.repository.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OrganizationOwnershipGuard } from './guards/organization-ownership.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.AUTH_RATE_LIMIT_TTL_MS ?? 60_000),
        limit: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS ?? 5),
      },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.getOrThrow('jwt.accessExpiresIn'),
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    PasswordService,
    RefreshTokenRepositoryService,
    RefreshTokenService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    OrganizationOwnershipGuard,
    EffectivePermissionsService,
    OrganizationOwnershipService,
  ],

  exports: [
    JwtModule,
    AuthService,
    PasswordService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    OrganizationOwnershipGuard,
    OrganizationOwnershipService,
    EffectivePermissionsService,
  ],
})
export class AuthModule {}
