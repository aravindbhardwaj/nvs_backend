import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Role } from '@prisma/client';
import { WhoIsWhoService, indiaToday } from './who-is-who.service';
import { CreateOfficerDto, UpdateOfficerDto } from './who-is-who.dto';
import { PrismaService } from '../prisma/prisma.service';
import { WhoIsWhoController } from './who-is-who.controller';
import { PublicWhoIsWhoController } from './public-who-is-who.controller';
import { REQUIRED_PERMISSIONS_KEY } from '../auth/decorators/require-permission.decorator';
import { OrganizationOwnershipService } from '../auth/services/organization-ownership.service';

const containing = (value: object): unknown =>
  expect.objectContaining(value) as unknown;
const anyValue = (value: unknown): unknown => expect.any(value) as unknown;

const payload = {
  officerName: 'Sh. Vikas Gupta, I.A.S.',
  officerName_hi: 'श्री विकास गुप्ता, आई.ए.एस.',
  designation: 'Commissioner',
  designation_hi: 'आयुक्त',
  phone: '0120-2975740',
  email: 'commissioner[dot]nvs[at]gov[dot]in',
};

describe('Who Is Who validation', () => {
  it('accepts sample data and preserves obfuscated email', async () => {
    const dto = plainToInstance(CreateOfficerDto, payload);
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.email).toBe(payload.email);
    expect(dto.phone).toBe('0120-2975740');
  });
  it('accepts and preserves multiple free-form values', async () => {
    const email =
      'commissioner[dot]nvs[at]gov[dot]in, commissioner[dot]nvs[at]gov[dot]in';
    const designation = 'Commissioner, Additional Charge: Chairman';
    const phone = '0120-2975740, 0120-2975741';
    const dto = plainToInstance(UpdateOfficerDto, {
      designation,
      phone,
      email,
    });

    expect(await validate(dto)).toHaveLength(0);
    expect(dto.designation).toBe(designation);
    expect(dto.phone).toBe(phone);
    expect(dto.email).toBe(email);
  });
  it.each(['2026-02-30', '2026-13-01', '2026-09-16T00:00:00Z', 'not-a-date'])(
    'rejects invalid date %s',
    async (retirementDate) => {
      expect(
        await validate(
          plainToInstance(CreateOfficerDto, { ...payload, retirementDate }),
        ),
      ).not.toHaveLength(0);
    },
  );
  it.each([
    { officerName: null },
    { officerName_hi: ' ' },
    { designation: ' ' },
    { designation_hi: null },
    { phone: null },
    { email: null },
    { isActive: 'false' },
    { displayOrder: -1 },
  ])('rejects invalid partial updates %j', async (change) => {
    expect(
      await validate(plainToInstance(UpdateOfficerDto, change)),
    ).not.toHaveLength(0);
  });
  it('allows omission and explicit retirement cutoff removal', async () => {
    expect(await validate(plainToInstance(UpdateOfficerDto, {}))).toHaveLength(
      0,
    );
    expect(
      await validate(
        plainToInstance(UpdateOfficerDto, { retirementDate: null }),
      ),
    ).toHaveLength(0);
  });
});

describe('Who Is Who service', () => {
  const actor = {
    id: 1,
    role: Role.HEADQUARTER,
    email: 'admin@example.com',
    organizationId: 1,
    organizationTypeId: 1,
  };
  const row = {
    id: 1,
    uuid: 'b93d8aa6-e7c2-43fd-9c4c-61bb6ce96c16',
    organizationId: 1,
    organization: {
      uuid: '76f5e4f4-c0f5-43d3-bacd-321b4d9b3a95',
    },
    ...payload,
    officerNameHi: payload.officerName_hi,
    designationHi: payload.designation_hi,
    retirementDate: '2026-09-16',
    displayOrder: 0,
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  let service: WhoIsWhoService;
  let db: {
    whoIsWho: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    auditLog: { create: jest.Mock };
    organization: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };
  beforeEach(() => {
    db = {
      whoIsWho: {
        findMany: jest.fn().mockResolvedValue([row]),
        findFirst: jest.fn().mockResolvedValue(row),
        create: jest.fn().mockResolvedValue(row),
        update: jest.fn().mockResolvedValue(row),
        count: jest.fn().mockResolvedValue(1),
      },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      organization: {
        findUnique: jest.fn().mockResolvedValue({ id: 1 }),
      },
      $transaction: jest.fn(),
    };
    db.$transaction.mockImplementation((operation: unknown) =>
      typeof operation === 'function'
        ? (operation as (client: typeof db) => Promise<unknown>)(db)
        : Promise.all(operation as Promise<unknown>[]),
    );
    service = new WhoIsWhoService(
      db as unknown as PrismaService,
      new OrganizationOwnershipService(),
    );
  });
  afterEach(() => jest.useRealTimers());
  it('switches the calendar date exactly at India midnight', () => {
    expect(indiaToday(new Date('2026-09-16T18:29:59.999Z'))).toBe('2026-09-16');
    expect(indiaToday(new Date('2026-09-16T18:30:00.000Z'))).toBe('2026-09-17');
  });
  it('uses identical retirement, active and deletion restrictions on public lists and details', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-16T18:30:00Z'));
    const result = await service.findPublic({
      organization_uuid: '76f5e4f4-c0f5-43d3-bacd-321b4d9b3a95',
    });
    await service.findPublicOne(row.uuid);
    const where = {
      organizationId: 1,
      isDeleted: false,
      isActive: true,
      OR: [{ retirementDate: null }, { retirementDate: { gte: '2026-09-17' } }],
    };
    expect(db.whoIsWho.findMany).toHaveBeenCalledWith(containing({ where }));
    expect(db.whoIsWho.findFirst).toHaveBeenCalledWith(
      containing({
        where: {
          isDeleted: false,
          isActive: true,
          OR: [
            { retirementDate: null },
            { retirementDate: { gte: '2026-09-17' } },
          ],
          uuid: row.uuid,
        },
      }),
    );
    expect(result[0]).not.toHaveProperty('retirementDate');
    expect(result[0]).not.toHaveProperty('createdAt');
  });
  it('returns 404 for unavailable public officers', async () => {
    db.whoIsWho.findFirst.mockResolvedValue(null);
    await expect(service.findPublicOne(1)).rejects.toThrow('Officer not found');
  });
  it('keeps admin reads independent of retirement', async () => {
    await service.findOne(1, actor);
    expect(db.whoIsWho.findFirst).toHaveBeenCalledWith(
      containing({ where: { id: 1, isDeleted: false } }),
    );
  });
  it('creates and audits an officer atomically', async () => {
    await service.create(plainToInstance(CreateOfficerDto, payload), actor);
    expect(db.whoIsWho.create).toHaveBeenCalledWith(
      containing({
        data: containing({
          officerNameHi: payload.officerName_hi,
          designationHi: payload.designation_hi,
          phone: '0120-2975740',
          email: payload.email,
          createdById: 1,
        }),
      }),
    );
    expect(await service.findOne(1, actor)).toEqual(
      containing({
        officerName_hi: payload.officerName_hi,
        designation_hi: payload.designation_hi,
      }),
    );
    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: containing({
        action: 'CREATE',
        entityId: 1,
        userId: 1,
      }),
    });
  });
  it('preserves omitted dates and supports explicit clearing', async () => {
    await service.update(1, { designation: 'Commissioner' }, actor);
    expect(
      (
        (db.whoIsWho.update.mock.calls as unknown[][])[0][0] as {
          data: { retirementDate?: string | null };
        }
      ).data.retirementDate,
    ).toBeUndefined();
    await service.update(1, { retirementDate: null }, actor);
    expect(
      (
        (db.whoIsWho.update.mock.calls as unknown[][])[1][0] as {
          data: { retirementDate?: string | null };
        }
      ).data.retirementDate,
    ).toBeNull();
    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: containing({
        action: 'UPDATE',
        previousValues: anyValue(Object),
      }),
    });
  });
  it('soft deletes and audits without deleting historical data', async () => {
    await service.remove(row.uuid, actor);
    expect(db.whoIsWho.update).toHaveBeenCalledWith(
      containing({
        where: { id: 1, isDeleted: false },
        data: containing({
          isDeleted: true,
          deletedById: 1,
          deletedAt: anyValue(Date),
        }),
      }),
    );
    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: containing({ action: 'DELETE' }),
    });
  });
  it('does not update or audit missing/deleted officers', async () => {
    db.whoIsWho.findFirst.mockResolvedValue(null);
    await expect(service.update(1, {}, actor)).rejects.toThrow(
      'Officer not found',
    );
    expect(db.whoIsWho.update).not.toHaveBeenCalled();
    expect(db.auditLog.create).not.toHaveBeenCalled();
  });
});

describe('Who Is Who route permissions', () => {
  it.each([
    ['create', 'CREATE'],
    ['findAll', 'VIEW'],
    ['findOne', 'VIEW'],
    ['findOneByUuid', 'VIEW'],
    ['update', 'UPDATE'],
    ['updateByUuid', 'UPDATE'],
    ['remove', 'DELETE'],
    ['removeByUuid', 'DELETE'],
  ])('protects %s', (method, permission) => {
    const handler = Object.getOwnPropertyDescriptor(
      WhoIsWhoController.prototype,
      method,
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      `WHO_IS_WHO_${permission}`,
    ]);
  });
  it('marks only the public controller public', () => {
    expect(Reflect.getMetadata('is_public', PublicWhoIsWhoController)).toBe(
      true,
    );
    expect(
      Reflect.getMetadata('is_public', WhoIsWhoController),
    ).toBeUndefined();
  });
});
