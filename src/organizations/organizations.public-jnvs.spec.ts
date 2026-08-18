import { OrganizationsService } from './organizations.service';
import { GetPublicJnvsQueryDto } from './dto/get-public-jnvs-query.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('OrganizationsService public JNV queries', () => {
  const prisma = {
    organization: { findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn(),
  };
  const service = new OrganizationsService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('allows up to 1,000 records per public JNV page only', async () => {
    await expect(
      validate(plainToInstance(GetPublicJnvsQueryDto, { limit: '1000' })),
    ).resolves.toHaveLength(0);
    await expect(
      validate(plainToInstance(GetPublicJnvsQueryDto, { limit: '1001' })),
    ).resolves.toHaveLength(1);
  });

  it('returns only active, non-deleted JNVs in the public website shape', async () => {
    prisma.$transaction.mockResolvedValue([
      [
        {
          id: 112,
          organizationName: 'JNV SRI SATHYA SAI (ANANTAPUR)',
          organizationHindiName: 'पीएम-श्री जवाहर नवोदय विद्यालय लेपाक्षी',
          organizationCode: 'JNV-SSSA',
          address: 'LEPAKSHI, SRI SATHYA SAI (ANANTAPUR) - 515331',
          estdYear: 1987,
          studentsCount: 0,
          state: { stateName: 'Andhra Pradesh', isoCode: 'IN-AP' },
          district: {
            districtName: 'SRI SATHYA SAI (ANANTAPUR)',
            nameHi: 'श्री सत्य साईं (अनंतपुर)',
          },
        },
      ],
      1,
    ]);

    await expect(
      service.findPublicJnvs({ page: 1, limit: 50 }),
    ).resolves.toEqual({
      items: [
        {
          id: 112,
          name: 'JNV SRI SATHYA SAI (ANANTAPUR)',
          stateCode: 'AP',
          address: 'LEPAKSHI, SRI SATHYA SAI (ANANTAPUR) - 515331',
          state: 'Andhra Pradesh',
          district: 'SRI SATHYA SAI (ANANTAPUR)',
          schoolUrl: '/nvs-school/ap/sssa',
          estd: 1987,
          students: 0,
          districtHi: 'श्री सत्य साईं (अनंतपुर)',
          nameHi: 'पीएम-श्री जवाहर नवोदय विद्यालय लेपाक्षी',
        },
      ],
      meta: {
        page: 1,
        limit: 50,
        totalItems: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });

    expect(prisma.organization.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationTypeId: 4,
          isDeleted: false,
          isFunctional: true,
        }),
      }),
    );
  });

  it('filters by the master-state abbreviation and district when supplied', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.findPublicJnvs({
      page: 1,
      limit: 20,
      state_code: 'ap',
      district_id: 101,
    });

    expect(prisma.organization.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          districtId: 101,
          state: {
            isoCode: { equals: 'IN-AP', mode: 'insensitive' },
          },
        }),
      }),
    );
  });

  it('preserves null values when optional source data is unavailable', async () => {
    prisma.$transaction.mockResolvedValue([
      [
        {
          id: 113,
          organizationName: 'JNV Example',
          organizationHindiName: null,
          organizationCode: '12345',
          address: null,
          estdYear: null,
          studentsCount: null,
          state: null,
          district: null,
        },
      ],
      1,
    ]);

    const result = await service.findPublicJnvs({ page: 1, limit: 20 });

    expect(result.items[0]).toEqual({
      id: 113,
      name: 'JNV Example',
      stateCode: null,
      address: null,
      state: null,
      district: null,
      schoolUrl: null,
      estd: null,
      students: null,
      districtHi: null,
      nameHi: null,
    });
  });
});
