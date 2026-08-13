import { Role, UserStatus } from '@prisma/client';

import { UsersService } from './users.service';

describe('UsersService', () => {
  const transaction = {
    user: { update: jest.fn() },
    refreshToken: { updateMany: jest.fn() },
    auditLog: { create: jest.fn() },
  };
  const prisma = {
    user: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  const password = { hash: jest.fn() };
  const service = new UsersService(prisma as never, password as never);
  const actor = {
    id: 1,
    email: 'super-admin@nvs.gov.in',
    role: Role.SUPER_ADMIN,
    organizationId: 1,
    organizationTypeId: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(transaction));
    prisma.user.findFirst.mockResolvedValue({
      id: 2,
      passwordChangedAt: null,
      organization: {
        id: 2,
        organizationName: 'NLI',
        organizationCode: 'NLI-01',
      },
      organizationTypeId: 2,
      organizationType: { id: 2, code: 'NLI', name: 'NLI' },
    });
    password.hash.mockResolvedValue('new-password-hash');
    transaction.user.update.mockResolvedValue({
      id: 2,
      name: 'NLI User',
      email: 'nli@nvs.gov.in',
      mobile: null,
      address: null,
      organizationId: 2,
      organizationTypeId: 2,
      organization: {
        id: 2,
        organizationName: 'NLI',
        organizationCode: 'NLI-01',
      },
      organizationType: { id: 2, code: 'NLI', name: 'NLI' },
      status: UserStatus.ACTIVE,
      lastLoginAt: null,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordChangedAt: new Date(),
    });
  });

  it('resets the password and invalidates every existing user session', async () => {
    await service.resetPassword(2, { password: 'SecurePassword123!' }, actor);

    expect(password.hash).toHaveBeenCalledWith('SecurePassword123!');
    expect(transaction.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 2 },
        data: expect.objectContaining({
          passwordHash: 'new-password-hash',
          sessionVersion: { increment: 1 },
          passwordResetRequired: false,
          updatedById: 1,
        }),
      }),
    );
    expect(transaction.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 2, revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(transaction.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'PASSWORD_RESET' }),
      }),
    );
  });
});
