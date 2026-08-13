import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { roleFromOrganizationTypeCode } from '../utils/organization-type-role.util';

import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: { organizationType: { select: { code: true } } },
    });

    if (
      !user ||
      user.isDeleted ||
      user.deletedAt ||
      user.status !== UserStatus.ACTIVE ||
      user.sessionVersion !== payload.sessionVersion ||
      (user.lockedUntil && user.lockedUntil > new Date())
    ) {
      throw new UnauthorizedException('User session is no longer valid.');
    }

    return {
      id: user.id,
      email: user.email,
      role: roleFromOrganizationTypeCode(user.organizationType.code),
      organizationId: user.organizationId,
      organizationTypeId: user.organizationTypeId,
    };
  }
}
