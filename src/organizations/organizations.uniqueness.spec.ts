import { BadRequestException, ConflictException } from '@nestjs/common';

import { OrganizationsService } from './organizations.service';

describe('Organization uniqueness', () => {
  const findFirst = jest.fn();
  const service = new OrganizationsService({
    organization: { findFirst },
  } as never);

  const ensureValuesAreUnique = (
    name: string,
    code: string,
    organizationTypeId: number,
    excludedId?: number,
  ) =>
    (
      service as unknown as {
        ensureValuesAreUnique: (
          name: string,
          code: string,
          organizationTypeId: number,
          excludedId?: number,
        ) => Promise<void>;
      }
    ).ensureValuesAreUnique(name, code, organizationTypeId, excludedId);

  beforeEach(() => jest.clearAllMocks());

  it('scopes organization-code uniqueness to the organization type', async () => {
    findFirst.mockResolvedValue(null);

    await ensureValuesAreUnique('JNV Example', 'SHARED-CODE', 4);

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { organizationName: 'JNV Example' },
          { organizationCode: 'SHARED-CODE', organizationTypeId: 4 },
        ],
      },
      select: { id: true },
    });
  });

  it('continues to exclude the current organization during updates', async () => {
    findFirst.mockResolvedValue(null);

    await ensureValuesAreUnique('JNV Example', 'SHARED-CODE', 4, 25);

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { not: 25 } }),
      }),
    );
  });

  it('continues to reject a duplicate name or same-type code', async () => {
    findFirst.mockResolvedValue({ id: 30 });

    await expect(
      ensureValuesAreUnique('JNV Example', 'SHARED-CODE', 4),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('Organization contact fields', () => {
  const service = new OrganizationsService({} as never);
  const withSupplementalFields = (
    organizationTypeCode: string,
    contactFields: {
      director_name_en?: string;
      phone_number?: string;
      email_address?: string;
    },
  ) =>
    (
      service as unknown as {
        withSupplementalFields: (
          data: Record<string, unknown>,
          dto: Record<string, unknown>,
          stateId: number | null,
          organizationTypeCode: string,
        ) => Promise<Record<string, unknown>>;
      }
    ).withSupplementalFields({}, contactFields, null, organizationTypeCode);

  it('accepts and stores contact fields for Regional Office organizations', async () => {
    await expect(
      withSupplementalFields('REGIONAL_OFFICE', {
        director_name_en: 'Regional Director',
        phone_number: '011-12345678',
        email_address: 'regional@example.gov.in',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        directorNameEn: 'Regional Director',
        phoneNumber: '011-12345678',
        emailAddress: 'regional@example.gov.in',
      }),
    );
  });

  it('continues to reject contact fields for JNV organizations', async () => {
    await expect(
      withSupplementalFields('JNV', { phone_number: '011-12345678' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
