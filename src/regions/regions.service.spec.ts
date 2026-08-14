import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateRegionDto } from './dto/create-region.dto';
import { RegionsService } from './regions.service';

describe('RegionsService', () => {
  const actor = {
    id: 1,
    email: 'super-admin@nvs.gov.in',
    role: Role.SUPER_ADMIN,
    organizationId: 1,
    organizationTypeId: 5,
  };
  const now = new Date();
  const transaction = {
    region: { create: jest.fn(), update: jest.fn() },
    auditLog: { create: jest.fn() },
  };
  const prisma = {
    region: { findFirst: jest.fn() },
    state: { count: jest.fn() },
    $transaction: jest.fn(),
  };
  const service = new RegionsService(prisma as never);

  const region = {
    id: 1,
    regionName: 'Bhopal Region',
    regionCode: 'BHOPAL',
    stateIds: '1,5,8',
    createdAt: now,
    updatedAt: now,
    createdById: 1,
    updatedById: 1,
    isDeleted: false,
    deletedAt: null,
    deletedById: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(transaction));
    prisma.region.findFirst.mockResolvedValue(null);
    prisma.state.count.mockResolvedValue(3);
    transaction.region.create.mockResolvedValue(region);
    transaction.region.update.mockResolvedValue(region);
  });

  it('creates a region with one valid State ID', async () => {
    prisma.state.count.mockResolvedValue(1);
    transaction.region.create.mockResolvedValue({ ...region, stateIds: '1' });

    await service.create(
      { regionName: 'Bhopal Region', regionCode: 'BHOPAL', state_ids: '1' },
      actor,
    );

    expect(transaction.region.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stateIds: '1' }),
      }),
    );
  });

  it('requires state_ids in the create request DTO', async () => {
    const errors = await validate(
      plainToInstance(CreateRegionDto, {
        regionName: 'Bhopal Region',
        regionCode: 'BHOPAL',
      }),
    );

    expect(errors.some((error) => error.property === 'state_ids')).toBe(true);
  });

  it('normalizes duplicate State IDs before creating a region', async () => {
    await service.create(
      {
        regionName: 'Bhopal Region',
        regionCode: 'BHOPAL',
        state_ids: '1,5,5,8,1',
      },
      actor,
    );

    expect(prisma.state.count).toHaveBeenCalledWith({
      where: { id: { in: [1, 5, 8] }, isDeleted: false },
    });
    expect(transaction.region.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stateIds: '1,5,8' }),
      }),
    );
  });

  it.each(['', '1,abc,8', '1,,8'])(
    'rejects invalid state_ids: %p',
    async (state_ids) => {
      await expect(
        service.create(
          { regionName: 'Bhopal Region', regionCode: 'BHOPAL', state_ids },
          actor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(transaction.region.create).not.toHaveBeenCalled();
    },
  );

  it('rejects a request when any State ID does not exist', async () => {
    prisma.state.count.mockResolvedValue(2);

    await expect(
      service.create(
        {
          regionName: 'Bhopal Region',
          regionCode: 'BHOPAL',
          state_ids: '1,5,999',
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(transaction.region.create).not.toHaveBeenCalled();
  });

  it('updates state_ids and returns it in the response', async () => {
    prisma.region.findFirst
      .mockResolvedValueOnce(region)
      .mockResolvedValueOnce(null);
    transaction.region.update.mockResolvedValue({
      ...region,
      stateIds: '2,6,9',
    });

    const response = await service.update(
      1,
      {
        regionName: 'Bhopal Region',
        regionCode: 'BHOPAL',
        state_ids: '2,6,9',
      },
      actor,
    );

    expect(transaction.region.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stateIds: '2,6,9' }),
      }),
    );
    expect(response).toEqual(expect.objectContaining({ state_ids: '2,6,9' }));
  });

  it('rejects an update with an invalid State ID', async () => {
    prisma.region.findFirst
      .mockResolvedValueOnce(region)
      .mockResolvedValueOnce(null);
    prisma.state.count.mockResolvedValue(2);

    await expect(
      service.update(
        1,
        {
          regionName: 'Bhopal Region',
          regionCode: 'BHOPAL',
          state_ids: '1,5,999',
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(transaction.region.update).not.toHaveBeenCalled();
  });

  it('includes state_ids in the region detail response', async () => {
    prisma.region.findFirst.mockResolvedValue(region);

    await expect(service.findOne(1)).resolves.toEqual(
      expect.objectContaining({ state_ids: '1,5,8' }),
    );
  });
});
