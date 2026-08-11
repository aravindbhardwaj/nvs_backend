import { ForbiddenException } from '@nestjs/common';
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
    organization: { findFirst: jest.fn() },
    mediaType: { findFirst: jest.fn() },
    media: { create: jest.fn() },
    $transaction: jest.fn(),
  };
  const ownership = { assertAccess: jest.fn() };
  const service = new MediaService(prisma as never, ownership as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.organization.findFirst.mockResolvedValue({ id: 2 });
    prisma.mediaType.findFirst.mockResolvedValue({ id: 1 });
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
        { title: 'Official notice', mediaTypeId: 1, organizationId },
        file,
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
        { title: 'Official notice', mediaTypeId: 1, organizationId: 3 },
        file,
        headquartersUser,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prisma.organization.findFirst).not.toHaveBeenCalled();
    expect(transaction.media.create).not.toHaveBeenCalled();
  });
});
