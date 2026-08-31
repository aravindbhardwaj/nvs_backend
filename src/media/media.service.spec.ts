import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

import { MediaService } from './media.service';

const superAdmin = {
  id: 1,
  email: 'super-admin@nvs.gov.in',
  role: Role.SUPER_ADMIN,
  organizationId: 1,
};

const headquartersUser = {
  id: 2,
  email: 'headquarters@nvs.gov.in',
  role: Role.HEADQUARTER,
  organizationId: 2,
};

const file = {
  originalname: 'notice.pdf',
  filename: 'notice-stored.pdf',
  path: '/tmp/notice-stored.pdf',
  mimetype: 'application/pdf',
  size: 100,
} as Express.Multer.File;

describe('MediaService', () => {
  const transaction = {
    media: { create: jest.fn() },
    auditLog: { create: jest.fn() },
  };
  const prisma = {
    organization: { findFirst: jest.fn(), findMany: jest.fn() },
    mediaType: { findFirst: jest.fn(), findMany: jest.fn() },
    media: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn(),
  };
  const ownership = { assertAccess: jest.fn() };
  const service = new MediaService(prisma as never, ownership);

  beforeEach(() => {
    jest.clearAllMocks();
    ownership.assertAccess.mockReset();
    prisma.organization.findFirst.mockResolvedValue({ id: 2 });
    prisma.organization.findMany.mockImplementation(({ where }) =>
      Promise.resolve(where.id.in.map((id: number) => ({ id }))),
    );
    prisma.mediaType.findFirst.mockResolvedValue({ id: 1 });
    prisma.mediaType.findMany.mockImplementation(({ where, select }) =>
      Promise.resolve(
        where.id.in.map((id: number) => ({
          id,
          ...(select?.nameEnglish
            ? { nameEnglish: id === 2 ? 'Notice Board' : 'Important Documents' }
            : {}),
        })),
      ),
    );
    jest.spyOn(service as never, 'checksum').mockResolvedValue('checksum');
    prisma.$transaction.mockImplementation((callback) => callback(transaction));
    transaction.media.create.mockImplementation(({ data }) => ({
      id: 1,
      ...data,
      uploadedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    }));
  });

  it.each([
    ['HEADQUARTER', 2],
    ['NLI', 3],
    ['REGIONAL_OFFICE', 4],
    ['JNV', 5],
  ])(
    'allows a Super Admin to upload media for %s',
    async (_level, organizationId) => {
      await service.upload(
        {
          titleEnglish: 'Official notice',
          titleHindi: 'आधिकारिक सूचना',
          mediaTypeId: 1,
          organizationId,
        },
        file,
        undefined,
        superAdmin,
      );

      expect(ownership.assertAccess).toHaveBeenCalledWith(
        organizationId,
        superAdmin,
      );
      expect(transaction.media.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ organizationId }),
        }),
      );
    },
  );

  it('prevents a non-Super-Admin from uploading media for another organization', async () => {
    ownership.assertAccess.mockImplementation(() => {
      throw new ForbiddenException();
    });

    await expect(
      service.upload(
        {
          titleEnglish: 'Official notice',
          titleHindi: 'आधिकारिक सूचना',
          mediaTypeId: 1,
          organizationId: 3,
        },
        file,
        undefined,
        headquartersUser,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prisma.organization.findFirst).not.toHaveBeenCalled();
    expect(transaction.media.create).not.toHaveBeenCalled();
  });

  it('stores display, activity, and hierarchy visibility fields during upload', async () => {
    await service.upload(
      {
        titleEnglish: 'Shared notice',
        titleHindi: 'साझा सूचना',
        mediaTypeId: 1,
        display_order: 2,
        is_active: false,
        visible_to_all: true,
      },
      file,
      undefined,
      headquartersUser,
    );

    expect(transaction.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          display_order: 2,
          isActive: false,
          visibleToAll: true,
        }),
      }),
    );
  });

  it.each([undefined, ''])(
    'defaults a missing or empty upload start date to today',
    async (startDate) => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-24T18:30:00.000Z'));

      try {
        await service.upload(
          {
            titleEnglish: 'Official notice',
            titleHindi: 'आधिकारिक सूचना',
            mediaTypeId: 1,
            start_date: startDate,
          },
          file,
          undefined,
          headquartersUser,
        );

        expect(transaction.media.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              startDate: new Date('2026-08-24T00:00:00.000Z'),
            }),
          }),
        );
      } finally {
        jest.useRealTimers();
      }
    },
  );

  it('stores independent important-link flags during upload', async () => {
    await service.upload(
      {
        titleEnglish: 'Important notice',
        titleHindi: 'महत्वपूर्ण सूचना',
        mediaTypeId: 1,
        important_link_1: true,
        important_link_2: null,
        important_link_3: true,
      },
      file,
      undefined,
      headquartersUser,
    );

    expect(transaction.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          importantLink1: true,
          importantLink2: null,
          importantLink3: true,
        }),
      }),
    );
  });

  it('normalizes and stores shared media type IDs during upload', async () => {
    await service.upload(
      {
        titleEnglish: 'Circular shared as a notice',
        titleHindi: 'सूचना के रूप में साझा परिपत्र',
        mediaTypeId: 1,
        sharedMediaTypeIds: '5,2,5',
      },
      file,
      undefined,
      headquartersUser,
    );

    expect(transaction.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sharedMediaTypeIds: '2,5' }),
      }),
    );
  });

  it('derives shared media placement names for the response', async () => {
    const result = await service.upload(
      {
        titleEnglish: 'Circular shared as a notice',
        titleHindi: 'सूचना के रूप में साझा परिपत्र',
        mediaTypeId: 1,
        sharedMediaTypeIds: '2,5',
      },
      file,
      undefined,
      headquartersUser,
    );

    expect(transaction.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sharedMediaTypeIds: '2,5',
        }),
      }),
    );
    expect(result.shared_media_placements).toEqual([
      { media_type_id: 2, placement_name: 'Notice Board' },
      { media_type_id: 5, placement_name: 'Important Documents' },
    ]);
  });

  it('matches the requested media type against primary and shared media types', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.findAll(
      {
        page: 1,
        limit: 20,
        sort: 'display_order',
        order: 'asc',
        organizationId: 1,
        mediaTypeId: 2,
      },
      superAdmin,
    );

    expect(prisma.media.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { mediaTypeId: 2 },
            { sharedMediaTypeIds: '2' },
            { sharedMediaTypeIds: { startsWith: '2,' } },
            { sharedMediaTypeIds: { endsWith: ',2' } },
            { sharedMediaTypeIds: { contains: ',2,' } },
          ],
        }),
      }),
    );
  });

  it('normalizes selected Regional Office and JNV IDs before storing selective visibility', async () => {
    await service.upload(
      {
        titleEnglish: 'Selective notice',
        titleHindi: 'चयनित सूचना',
        mediaTypeId: 1,
        visible_to_all: false,
        ro_ids: '10,12,10',
        jnv_ids: '28,29,28',
      },
      file,
      undefined,
      headquartersUser,
    );

    expect(transaction.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          visibleToAll: false,
          roIds: '10,12',
          jnvIds: '28,29',
        }),
      }),
    );
    expect(prisma.organization.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { in: [10, 12] } }),
      }),
    );
  });

  it.each([
    [{ visible_to_all: true, ro_ids: '10,12' }],
    [{ visible_to_all: true, jnv_ids: '28' }],
    [{ visible_to_all: false, jnv_ids: '28' }],
    [{ ro_ids: '10,abc,12' }],
    [{ ro_ids: '10', jnv_ids: '28,abc' }],
  ])(
    'rejects invalid selective visibility configuration',
    async (visibility) => {
      await expect(
        service.upload(
          {
            titleEnglish: 'Invalid notice',
            titleHindi: 'अमान्य सूचना',
            mediaTypeId: 1,
            ...visibility,
          },
          file,
          undefined,
          headquartersUser,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );

  it('rejects selected IDs that are not active Regional Offices', async () => {
    prisma.organization.findMany.mockResolvedValue([{ id: 10 }]);

    await expect(
      service.upload(
        {
          titleEnglish: 'Invalid RO',
          titleHindi: 'अमान्य आरओ',
          mediaTypeId: 1,
          ro_ids: '10,12',
        },
        file,
        undefined,
        headquartersUser,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('adds exact selected-RO matching to Regional Office visibility', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.findAll(
      { page: 1, limit: 20, sort: 'display_order', order: 'asc' },
      { ...headquartersUser, role: Role.REGIONAL, organizationId: 10 },
    );

    expect(prisma.media.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: [
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({
                  AND: expect.arrayContaining([
                    {
                      OR: [{ visibleToAll: false }, { visibleToAll: null }],
                    },
                    {
                      OR: [
                        { roIds: '10' },
                        { roIds: { startsWith: '10,' } },
                        { roIds: { endsWith: ',10' } },
                        { roIds: { contains: ',10,' } },
                      ],
                    },
                  ]),
                }),
              ]),
            }),
          ],
        }),
      }),
    );
  });

  it('uses explicit JNV selective scope and stable display ordering for JNVs', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);
    prisma.organization.findFirst.mockResolvedValue({
      id: 28,
      parentOrganizationId: 10,
    });

    await service.findAll(
      {
        page: 1,
        limit: 20,
        sort: 'display_order',
        order: 'asc',
        is_active: true,
      },
      { ...headquartersUser, role: Role.JNV, organizationId: 28 },
    );

    expect(prisma.media.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isDeleted: false,
          isActive: true,
          AND: [
            {
              OR: [
                { organizationId: 28 },
                {
                  visibleToAll: true,
                  organization: {
                    organizationType: { code: 'HEADQUARTER' },
                  },
                },
                {
                  organization: {
                    organizationType: { code: 'HEADQUARTER' },
                  },
                  AND: expect.arrayContaining([
                    {
                      OR: [{ visibleToAll: false }, { visibleToAll: null }],
                    },
                    {
                      OR: [
                        { roIds: '10' },
                        { roIds: { startsWith: '10,' } },
                        { roIds: { endsWith: ',10' } },
                        { roIds: { contains: ',10,' } },
                      ],
                    },
                    {
                      OR: [
                        { jnvIds: '28' },
                        { jnvIds: { startsWith: '28,' } },
                        { jnvIds: { endsWith: ',28' } },
                        { jnvIds: { contains: ',28,' } },
                      ],
                    },
                  ]),
                },
                {
                  visibleToAll: true,
                  organization: {
                    organizationType: { code: 'REGIONAL_OFFICE' },
                    childOrganizations: { some: { id: 28 } },
                  },
                },
              ],
            },
          ],
        },
        orderBy: [
          { display_order: 'asc' },
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
      }),
    );
  });

  it('applies explicit JNV selective scope and public eligibility in the public JNV listing', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);
    prisma.organization.findFirst.mockResolvedValue({
      id: 28,
      parentOrganizationId: 10,
      organizationType: { code: 'JNV' },
    });

    await service.findPublic({
      page: 1,
      limit: 20,
      organization_id: 28,
      media_type_id: 2,
    });

    expect(prisma.media.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isDeleted: false,
          isActive: true,
          OR: [
            { mediaTypeId: 2 },
            { sharedMediaTypeIds: '2' },
            { sharedMediaTypeIds: { startsWith: '2,' } },
            { sharedMediaTypeIds: { endsWith: ',2' } },
            { sharedMediaTypeIds: { contains: ',2,' } },
          ],
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                { organizationId: 28 },
                expect.objectContaining({
                  visibleToAll: true,
                  organizationId: 10,
                }),
                expect.objectContaining({
                  AND: [
                    {
                      OR: [{ visibleToAll: false }, { visibleToAll: null }],
                    },
                    {
                      OR: [
                        { roIds: '10' },
                        { roIds: { startsWith: '10,' } },
                        { roIds: { endsWith: ',10' } },
                        { roIds: { contains: ',10,' } },
                      ],
                    },
                    {
                      OR: [
                        { jnvIds: '28' },
                        { jnvIds: { startsWith: '28,' } },
                        { jnvIds: { endsWith: ',28' } },
                        { jnvIds: { contains: ',28,' } },
                      ],
                    },
                  ],
                }),
              ]),
            }),
          ]),
        }),
        orderBy: [
          { display_order: 'asc' },
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
      }),
    );
  });

  it('adds the requested important-link flag to the shared public visibility query', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);
    prisma.organization.findFirst.mockResolvedValue({
      id: 2,
      parentOrganizationId: null,
      organizationType: { code: 'HEADQUARTER' },
    });

    await service.findImportantLinks(
      { page: 1, limit: 20, organization_id: 2 },
      'importantLink2',
    );

    expect(prisma.media.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isDeleted: false,
          isActive: true,
          AND: expect.arrayContaining([{ importantLink2: true }]),
        }),
        orderBy: [
          { display_order: 'asc' },
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
      }),
    );
  });
});
