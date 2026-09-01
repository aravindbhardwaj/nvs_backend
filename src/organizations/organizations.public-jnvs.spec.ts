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
          organizationName: 'JNV SRI SATHYA SAI (ANANTAPUR), Andhra Pradesh',
          organizationHindiName:
            'पीएम-श्री जवाहर नवोदय विद्यालय लेपाक्षी, श्री सत्य साईं',
          organizationCode: 'JNV-SSSA',
          address: 'LEPAKSHI, SRI SATHYA SAI (ANANTAPUR) - 515331',
          estdYear: 1987,
          studentsCount: 0,
          region: {
            dcRoName: 'BHOPAL',
            dcRoNameHi: 'भोपाल',
            regionName: 'Bhopal Region',
            regionNameHi: 'भोपाल क्षेत्र',
          },
          state: {
            stateName: 'Andhra Pradesh',
            nameHi: 'आंध्र प्रदेश',
            isoCode: 'IN-AP',
          },
          district: {
            districtName: 'SRI SATHYA SAI (ANANTAPUR)',
            nameHi: 'श्री सत्य साईं (अनंतपुर)',
          },
          jnvPrincipals: [
            {
              principalNameEnglish: 'Sample Principal',
              principalNameHindi: 'नमूना प्राचार्य',
              email: 'principal@example.com',
              mobile: '9876543210',
            },
          ],
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
          name: 'JNV SRI SATHYA SAI (ANANTAPUR), Andhra Pradesh',
          stateCode: 'AP',
          address: 'LEPAKSHI, SRI SATHYA SAI (ANANTAPUR) - 515331',
          state: 'Andhra Pradesh',
          stateHi: 'आंध्र प्रदेश',
          district: 'SRI SATHYA SAI (ANANTAPUR)',
          schoolUrl: '/nvs-school/ap/sssa',
          estd: 1987,
          students: 0,
          districtHi: 'श्री सत्य साईं (अनंतपुर)',
          nameHi: 'पीएम-श्री जवाहर नवोदय विद्यालय लेपाक्षी, श्री सत्य साईं',
          dc_ro_name: 'BHOPAL',
          dc_ro_name_hi: 'भोपाल',
          ro_name: 'Bhopal Region',
          ro_name_hi: 'भोपाल क्षेत्र',
          principal_name_english: 'Sample Principal',
          principal_name_hindi: 'नमूना प्राचार्य',
          principal_email: 'principal@example.com',
          principal_mobile: '9876543210',
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
        select: expect.objectContaining({
          jnvPrincipals: {
            where: { isActive: true, isDeleted: false, relievedAt: null },
            select: {
              principalNameEnglish: true,
              principalNameHindi: true,
              email: true,
              mobile: true,
            },
            orderBy: [{ joinedAt: 'desc' }, { id: 'desc' }],
            take: 1,
          },
        }),
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
          region: null,
          state: null,
          district: null,
          jnvPrincipals: [],
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
      stateHi: null,
      district: null,
      schoolUrl: null,
      estd: null,
      students: null,
      districtHi: null,
      nameHi: null,
      dc_ro_name: null,
      dc_ro_name_hi: null,
      ro_name: null,
      ro_name_hi: null,
      principal_name_english: null,
      principal_name_hindi: null,
      principal_email: null,
      principal_mobile: null,
    });
  });

  it('returns the public JNV state map grouped by state code', async () => {
    prisma.organization.findMany.mockResolvedValue([
      {
        state: { isoCode: 'IN-AN' },
        region: { regionName: 'Hyderabad' },
      },
      {
        state: { isoCode: 'IN-AN' },
        region: { regionName: 'Hyderabad' },
      },
      {
        state: { isoCode: 'IN-AP' },
        region: { regionName: 'Hyderabad Region' },
      },
    ]);

    await expect(service.findPublicJnvStateMap()).resolves.toEqual({
      an: ['Hyderabad', 2, 'AN'],
      ap: ['Hyderabad', 1, 'AP'],
    });
  });
});
