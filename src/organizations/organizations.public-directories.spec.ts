import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { GetPublicOrganizationsQueryDto } from './dto/get-public-organizations-query.dto';
import { OrganizationsService } from './organizations.service';

describe('Public RO and NLI directories', () => {
  const prisma = {
    organization: { findMany: jest.fn(), count: jest.fn() },
    state: { findMany: jest.fn() },
    $transaction: jest.fn(),
  };
  const service = new OrganizationsService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('validates pagination and permits a full directory page', async () => {
    await expect(
      validate(
        plainToInstance(GetPublicOrganizationsQueryDto, { limit: '1000' }),
      ),
    ).resolves.toHaveLength(0);
    await expect(
      validate(
        plainToInstance(GetPublicOrganizationsQueryDto, { limit: '1001' }),
      ),
    ).resolves.toHaveLength(1);
  });

  it('lists public regional offices with region and state details', async () => {
    prisma.$transaction.mockResolvedValue([
      [
        {
          id: 12,
          uuid: '550e8400-e29b-41d4-a716-446655440000',
          organizationName: 'Example',
          organizationHindiName: 'उदाहरण',
          organizationNameHi: null,
          organizationCode: 'EXAMPLE',
          address: null,
          addressHindi: null,
          shortDescription: 'Regional office summary',
          imageUrl: '/uploads/regional-office.jpg',
          region: {
            regionName: 'Bhopal Region',
            regionNameHi: 'भोपाल क्षेत्र',
            stateIds: '5,8',
            dcRoName: 'Deputy Commissioner, Bhopal',
            dcRoNameHi: 'उपायुक्त, भोपाल',
            address: 'Sector 12, Bhopal',
            addressHindi: 'सेक्टर 12, भोपाल',
            phone: '0755-1234567',
            email: 'robhopal[at]nvs[dot]gov[dot]in',
          },
        },
      ],
      1,
    ]);
    prisma.state.findMany.mockResolvedValue([
      { id: 5, stateName: 'Gujarat', nameHi: 'गुजरात' },
      {
        id: 8,
        stateName: 'Dadra & Nagar Haveli and Daman & Diu U.T.',
        nameHi: 'दादरा और नगर हवेली और दमन और दीव केंद्र शासित प्रदेश',
      },
    ]);

    const response = await service.findPublicRegionalOffices({
      page: 1,
      limit: 20,
    });
    expect(response.items).toEqual([
      {
        id: 12,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        url: '/ro/example',
        name: 'Example',
        nameHi: 'उदाहरण',
        code: 'EXAMPLE',
        address: null,
        address_hindi: null,
        region: 'Bhopal Region',
        regionHi: 'भोपाल क्षेत्र',
        dcRoName: 'Deputy Commissioner, Bhopal',
        dcRoNameHi: 'उपायुक्त, भोपाल',
        regionAddress: 'Sector 12, Bhopal',
        regionAddressHindi: 'सेक्टर 12, भोपाल',
        regionPhone: '0755-1234567',
        regionEmail: 'robhopal[at]nvs[dot]gov[dot]in',
        stateNames: 'Gujarat, Dadra & Nagar Haveli and Daman & Diu U.T.',
        stateNamesHi:
          'गुजरात, दादरा और नगर हवेली और दमन और दीव केंद्र शासित प्रदेश',
        short_description: 'Regional office summary',
        image_url: '/uploads/regional-office.jpg',
      },
    ]);
    expect(prisma.organization.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationType: { code: 'REGIONAL_OFFICE', isActive: true },
          isDeleted: false,
          isFunctional: true,
        },
        skip: 0,
        take: 20,
      }),
    );
    expect(prisma.organization.count).toHaveBeenCalledWith({
      where: {
        organizationType: { code: 'REGIONAL_OFFICE', isActive: true },
        isDeleted: false,
        isFunctional: true,
      },
    });
  });

  it('returns only the requested public NLI fields', async () => {
    prisma.$transaction.mockResolvedValue([
      [
        {
          uuid: '550e8400-e29b-41d4-a716-446655440001',
          organizationCode: 'NLI-NOIDA',
          organizationName: 'National Leadership Institute',
          organizationHindiName: 'राष्ट्रीय नेतृत्व संस्थान',
          organizationNameEn: null,
          organizationNameHi: null,
          directorNameEn: 'Example Director',
          directorNameHi: 'उदाहरण निदेशक',
          address: 'Example address',
          addressHindi: 'उदाहरण पता',
          phoneNumber: '0120-1234567',
          emailAddress: 'director@example.gov.in',
          shortDescription: 'NLI summary',
          shortDescriptionHi: 'एनएलआई सारांश',
          imageUrl: '/uploads/nli.jpg',
        },
      ],
      1,
    ]);

    const response = await service.findPublicNlis({ page: 1, limit: 20 });

    expect(response.items).toEqual([
      {
        uuid: '550e8400-e29b-41d4-a716-446655440001',
        url: '/nli/nli-noida',
        name_en: 'National Leadership Institute',
        name_hi: 'राष्ट्रीय नेतृत्व संस्थान',
        director_name_en: 'Example Director',
        director_name_hi: 'उदाहरण निदेशक',
        address_en: 'Example address',
        address_hi: 'उदाहरण पता',
        phone_number: '0120-1234567',
        email_address: 'director@example.gov.in',
        short_description: 'NLI summary',
        short_description_hi: 'एनएलआई सारांश',
        image_url: '/uploads/nli.jpg',
      },
    ]);
    expect(Object.keys(response.items[0])).toEqual([
      'uuid',
      'url',
      'name_en',
      'name_hi',
      'director_name_en',
      'director_name_hi',
      'address_en',
      'address_hi',
      'phone_number',
      'email_address',
      'short_description',
      'short_description_hi',
      'image_url',
    ]);
  });
});
