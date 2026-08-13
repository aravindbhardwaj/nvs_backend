import { Injectable } from '@nestjs/common';
import { Prisma, RefreshToken } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RefreshTokenRepositoryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.refreshToken.findMany({
      include: { user: { include: { organizationType: { select: { code: true } } } } },
    });
  }

  create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  async revoke(id: number, revokedAt: Date): Promise<boolean> {
    const result = await this.prisma.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt },
    });

    return result.count === 1;
  }

  cleanupExpired(now: Date): Promise<Prisma.BatchPayload> {
    return this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: now } },
    });
  }
}
