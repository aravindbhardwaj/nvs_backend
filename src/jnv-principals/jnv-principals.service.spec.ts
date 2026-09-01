import { BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JnvPrincipalsService } from './jnv-principals.service';

describe('JnvPrincipalsService', () => {
  const principal = {
    id: 9,
    organizationId: 42,
    principalNameEnglish: 'New Principal',
    principalNameHindi: null,
    principalDesignationEnglish: null,
    principalDesignationHindi: null,
    email: 'principal@example.com',
    mobile: '9876543210',
    messageEnglish: null,
    messageHindi: null,
    storedFilename: null,
    imagePath: null,
    mimeType: null,
    extension: null,
    fileSize: null,
    joinedAt: new Date('2026-08-01'),
    relievedAt: null,
    displayOrder: 0,
    isActive: true,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    createdById: 1,
    updatedById: 1,
    isDeleted: false,
    deletedAt: null,
    deletedById: null,
  };
  const transaction = {
    jnvPrincipal: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  };
  const prisma = {
    organization: { findFirst: jest.fn() },
    jnvPrincipal: { findFirst: jest.fn(), findMany: jest.fn() },
    $transaction: jest.fn((callback: (value: typeof transaction) => unknown) =>
      callback(transaction),
    ),
  };
  const service = new JnvPrincipalsService(prisma as never);
  const actor = {
    id: 1,
    email: 'admin@nvs.gov.in',
    role: Role.SUPER_ADMIN,
    organizationId: 1,
    organizationTypeId: 1,
  };

  beforeEach(() => jest.clearAllMocks());

  it('closes the previous current tenure and creates the replacement atomically', async () => {
    prisma.organization.findFirst.mockResolvedValue({ id: 42 });
    transaction.jnvPrincipal.findFirst.mockResolvedValue({
      ...principal,
      id: 8,
      joinedAt: new Date('2024-01-01'),
    });
    transaction.jnvPrincipal.create.mockResolvedValue(principal);

    const result = await service.create(
      42,
      {
        principalNameEnglish: 'New Principal',
        email: 'principal@example.com',
        mobile: '9876543210',
        joinedAt: new Date('2026-08-01'),
      },
      undefined,
      actor,
    );

    expect(transaction.jnvPrincipal.updateMany).toHaveBeenCalledWith({
      where: { organizationId: 42, relievedAt: null, isDeleted: false },
      data: { relievedAt: new Date('2026-08-01'), updatedById: 1 },
    });
    expect(transaction.jnvPrincipal.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        organizationId: 42,
        principalNameEnglish: 'New Principal',
      }),
    );
  });

  it('rejects an organization that is not an active JNV', async () => {
    prisma.organization.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        2,
        { principalNameEnglish: 'Principal' },
        undefined,
        actor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('exposes only the active, non-deleted current principal publicly', async () => {
    prisma.organization.findFirst.mockResolvedValue({ id: 42 });
    prisma.jnvPrincipal.findFirst.mockResolvedValue(principal);

    await service.findPublicCurrent(42);

    expect(prisma.jnvPrincipal.findFirst).toHaveBeenCalledWith({
      where: {
        organizationId: 42,
        relievedAt: null,
        isActive: true,
        isDeleted: false,
      },
    });
  });
});
