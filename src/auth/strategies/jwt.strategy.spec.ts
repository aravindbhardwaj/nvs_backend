import { UnauthorizedException } from '@nestjs/common';
import { Role, UserStatus } from '@prisma/client';

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const prisma = { user: { findUnique: jest.fn() } };
  const config = { getOrThrow: jest.fn().mockReturnValue('test-secret') };
  const strategy = new JwtStrategy(config as never, prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('rejects an access token invalidated by logout', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@nvs.gov.in',
      role: Role.HEADQUARTER,
      organizationId: 2,
      status: UserStatus.ACTIVE,
      sessionVersion: 1,
      isDeleted: false,
      deletedAt: null,
      lockedUntil: null,
    });

    await expect(
      strategy.validate({
        userId: 1,
        organizationId: 2,
        role: Role.HEADQUARTER,
        sessionVersion: 0,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
