import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

import { BannersService } from './banners.service';

const actor = {
  id: 10,
  organizationId: 5,
  role: Role.HEADQUARTER,
  email: 'user@nvs.gov.in',
};

describe('BannersService', () => {
  const prisma = {
    banner: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const ownership = { assertAccess: jest.fn() };
  const service = new BannersService(prisma as never, ownership as never);

  beforeEach(() => jest.clearAllMocks());

  it('rejects an end date before the start date before changing a banner', async () => {
    prisma.banner.findFirst.mockResolvedValue({
      id: 1,
      organizationId: 5,
      startDate: null,
      endDate: null,
    });

    await expect(
      service.update(
        1,
        {
          start_date: '2026-08-12',
          end_date: '2026-08-11',
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('enforces organization ownership before updates', async () => {
    prisma.banner.findFirst.mockResolvedValue({
      id: 1,
      organizationId: 6,
      startDate: null,
      endDate: null,
    });
    ownership.assertAccess.mockImplementation(() => {
      throw new ForbiddenException();
    });

    await expect(service.update(1, {}, actor)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('limits a non-super-admin management list to the actor organization', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.findAll(
      { page: 1, limit: 20, sort: 'displayOrder', order: 'asc' },
      actor,
    );

    expect(prisma.banner.findMany.mock.calls[0][0]).toMatchObject({
      where: { organizationId: 5, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    });
  });

  it('uses only active, in-window banners for the public list', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.findDisplayable({ page: 1, limit: 20 });

    expect(prisma.banner.findMany.mock.calls[0][0]).toMatchObject({
      where: { isDeleted: false, isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
    });
  });
});
