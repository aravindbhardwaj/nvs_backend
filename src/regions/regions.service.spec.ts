import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateRegionDto } from './dto/create-region.dto';
import { RegionsService } from './regions.service';

const containing = (value: object): unknown =>
  expect.objectContaining(value) as unknown;

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
    region: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    state: { count: jest.fn() },
    $transaction: jest.fn(),
  };
  const service = new RegionsService(prisma as never);

  const region = {
    id: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    regionName: 'Bhopal Region',
    regionNameHi: 'भोपाल क्षेत्र',
    regionCode: 'BHOPAL',
    dcRoName: 'Deputy Commissioner, Bhopal',
    dcRoNameHi: 'उपायुक्त, भोपाल',
    stateIds: '1,5,8',
    address: 'Sector 12, Bhopal',
    addressHindi: 'सेक्टर 12, भोपाल',
    phone: '0755-1234567, 0755-1234568',
    email: 'robhopal[at]nvs[dot]gov[dot]in',
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
    prisma.$transaction.mockImplementation((operation: unknown) =>
      typeof operation === 'function'
        ? (operation as (client: typeof transaction) => Promise<unknown>)(
            transaction,
          )
        : Promise.all(operation as Promise<unknown>[]),
    );
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
      containing({
        data: containing({ stateIds: '1' }),
      }),
    );
  });

  it('creates and returns all optional regional office fields', async () => {
    const dto = {
      regionName: 'Bhopal Region',
      regionCode: 'BHOPAL',
      state_ids: '1,5,8',
      regionNameHi: region.regionNameHi,
      dcRoName: region.dcRoName,
      dcRoNameHi: region.dcRoNameHi,
      address: region.address,
      addressHindi: region.addressHindi,
      phone: region.phone,
      email: region.email,
    };

    await expect(service.create(dto, actor)).resolves.toEqual(
      containing({
        regionNameHi: region.regionNameHi,
        dcRoName: region.dcRoName,
        dcRoNameHi: region.dcRoNameHi,
        address: region.address,
        addressHindi: region.addressHindi,
        phone: region.phone,
        email: region.email,
      }),
    );
    expect(transaction.region.create).toHaveBeenCalledWith(
      containing({
        data: containing({
          regionNameHi: region.regionNameHi,
          dcRoName: region.dcRoName,
          dcRoNameHi: region.dcRoNameHi,
          address: region.address,
          addressHindi: region.addressHindi,
          phone: region.phone,
          email: region.email,
        }),
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
      containing({
        data: containing({ stateIds: '1,5,8' }),
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
      containing({
        data: containing({ stateIds: '2,6,9' }),
      }),
    );
    expect(response).toEqual(containing({ state_ids: '2,6,9' }));
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
      containing({ state_ids: '1,5,8' }),
    );
  });

  it('returns contact fields through the public region API service', async () => {
    prisma.region.findMany.mockResolvedValue([region]);
    prisma.region.count.mockResolvedValue(1);

    const response = await service.findPublic({ page: 1, limit: 20 });

    expect(response.items).toEqual([
      {
        id: region.id,
        uuid: region.uuid,
        regionName: region.regionName,
        regionNameHi: region.regionNameHi,
        regionCode: region.regionCode,
        dcRoName: region.dcRoName,
        dcRoNameHi: region.dcRoNameHi,
        address: region.address,
        addressHindi: region.addressHindi,
        phone: region.phone,
        email: region.email,
      },
    ]);
    expect(prisma.region.findMany).toHaveBeenCalledWith(
      containing({ where: { isDeleted: false } }),
    );
  });
});
