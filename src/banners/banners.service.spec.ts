import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

jest.mock('./banner.storage', () => ({
  BANNER_UPLOADS_ROOT: 'resources/banner_uploads',
  validateBannerImage: jest.fn(),
}));

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
      create: jest.fn(),
    },
    auditLog: { create: jest.fn() },
    organization: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  const ownership = { assertAccess: jest.fn() };
  const configService = { get: jest.fn().mockReturnValue(5) };
  const service = new BannersService(
    prisma as never,
    ownership,
    configService as never,
  );

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

  it('applies the target organization banner limit to a super administrator', async () => {
    const createdBanner = {
      id: 1,
      organizationId: 6,
      titleEnglish: 'Banner',
      titleHindi: 'बैनर',
      descriptionEnglish: null,
      descriptionHindi: null,
      altTextEnglish: null,
      altTextHindi: null,
      storedFilename: 'banner.png',
      imagePath: 'resources/banner_uploads/banner.png',
      mimeType: 'image/png',
      extension: 'png',
      fileSize: BigInt(8),
      display_order: 0,
      isActive: true,
      visibleToAll: false,
      startDate: null,
      endDate: null,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.$transaction.mockImplementation(async (callback) =>
      callback({ banner: prisma.banner, auditLog: prisma.auditLog }),
    );
    ownership.assertAccess.mockReset();
    prisma.organization.findFirst.mockResolvedValue({ id: 6 });
    prisma.banner.count.mockResolvedValue(4);
    prisma.banner.create.mockResolvedValue(createdBanner);

    await service.create(
      { organizationId: 6, titleEnglish: 'Banner', titleHindi: 'बैनर' },
      {
        filename: 'banner.png',
        path: 'resources/banner_uploads/banner.png',
        mimetype: 'image/png',
        originalname: 'banner.png',
        size: 8,
      } as Express.Multer.File,
      { ...actor, role: Role.SUPER_ADMIN },
    );

    expect(prisma.banner.count).toHaveBeenCalledWith({
      where: { organizationId: 6, isDeleted: false, isActive: true },
    });
    expect(prisma.banner.create).toHaveBeenCalled();
  });

  it('does not count inactive banners toward the upload limit', async () => {
    prisma.$transaction.mockImplementation(async (callback) =>
      callback({ banner: prisma.banner, auditLog: prisma.auditLog }),
    );
    prisma.organization.findFirst.mockResolvedValue({ id: 5 });
    prisma.banner.create.mockResolvedValue({
      id: 1,
      organizationId: 5,
      titleEnglish: 'Inactive banner',
      titleHindi: 'निष्क्रिय बैनर',
      descriptionEnglish: null,
      descriptionHindi: null,
      altTextEnglish: null,
      altTextHindi: null,
      storedFilename: 'banner.png',
      imagePath: 'resources/banner_uploads/banner.png',
      mimeType: 'image/png',
      extension: 'png',
      fileSize: BigInt(8),
      display_order: 0,
      isActive: false,
      visibleToAll: null,
      startDate: null,
      endDate: null,
      createdById: actor.id,
      updatedById: actor.id,
      isDeleted: false,
      deletedAt: null,
      deletedById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.create(
      {
        titleEnglish: 'Inactive banner',
        titleHindi: 'निष्क्रिय बैनर',
        isActive: false,
      },
      {
        filename: 'banner.png',
        path: 'resources/banner_uploads/banner.png',
        mimetype: 'image/png',
        originalname: 'banner.png',
        size: 8,
      } as Express.Multer.File,
      actor,
    );

    expect(prisma.banner.count).not.toHaveBeenCalled();
    expect(prisma.banner.create).toHaveBeenCalled();
  });

  it('returns the actionable message when the active banner limit is reached', async () => {
    prisma.$transaction.mockImplementation(async (callback) =>
      callback({ banner: prisma.banner, auditLog: prisma.auditLog }),
    );
    prisma.organization.findFirst.mockResolvedValue({ id: 5 });
    prisma.banner.count.mockResolvedValue(5);

    await expect(
      service.create(
        { titleEnglish: 'Banner', titleHindi: 'बैनर' },
        {
          filename: 'banner.png',
          path: 'resources/banner_uploads/banner.png',
          mimetype: 'image/png',
          originalname: 'banner.png',
          size: 8,
        } as Express.Multer.File,
        actor,
      ),
    ).rejects.toThrow(
      'Banner limit reached. Please deactivate, delete, or replace an existing banner to continue.',
    );
    expect(prisma.banner.create).not.toHaveBeenCalled();
  });

  it('includes only the actor organization for a Headquarters management list', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.findAll(
      { page: 1, limit: 20, sort: 'display_order', order: 'asc' },
      actor,
    );

    expect(prisma.banner.findMany.mock.calls[0][0]).toMatchObject({
      where: {
        isDeleted: false,
        AND: [{ organizationId: 5 }],
      },
      orderBy: [
        { display_order: 'asc' },
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
    });
  });

  it('includes own, Headquarters, and parent Regional Office banners for a JNV', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.findAll(
      { page: 1, limit: 20, sort: 'display_order', order: 'asc' },
      { ...actor, role: Role.JNV, organizationId: 28 },
    );

    expect(prisma.banner.findMany.mock.calls[0][0].where).toMatchObject({
      AND: [
        {
          OR: [
            { organizationId: 28 },
            {
              visibleToAll: true,
              organization: { organizationType: { code: 'HEADQUARTER' } },
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
    });
  });

  it('uses only active, in-window banners for the public list', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.findDisplayable({ page: 1, limit: 20 });

    expect(prisma.banner.findMany.mock.calls[0][0]).toMatchObject({
      where: { isDeleted: false, isActive: true },
      orderBy: [
        { display_order: 'asc' },
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
    });
  });
});
