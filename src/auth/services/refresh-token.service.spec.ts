import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenService', () => {
  const transaction = {
    refreshToken: { updateMany: jest.fn() },
    user: { update: jest.fn() },
    auditLog: { create: jest.fn() },
  };
  const prisma = { $transaction: jest.fn() };
  const config = {};
  const password = {};
  const repository = {};
  const service = new RefreshTokenService(
    prisma as never,
    config as never,
    password as never,
    repository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(transaction));
    transaction.refreshToken.updateMany.mockResolvedValue({ count: 1 });
  });

  it('increments the session version when logging out', async () => {
    jest.spyOn(service, 'validate').mockResolvedValue({
      token: { id: 10, userId: 5 },
      user: { id: 5 },
    } as never);

    await service.revoke('refresh-token', 5);

    expect(transaction.user.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { sessionVersion: { increment: 1 } },
    });
  });
});
