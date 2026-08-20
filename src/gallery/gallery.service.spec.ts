import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { GalleryService } from './gallery.service';

const actor = {
  id: 10,
  organizationId: 5,
  role: Role.HEADQUARTER,
  email: 'user@nvs.gov.in',
};

describe('GalleryService', () => {
  const prisma = {
    galleryImage: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const ownership = { assertAccess: jest.fn() };
  const service = new GalleryService(prisma as never, ownership);
  beforeEach(() => jest.clearAllMocks());

  it('limits a non-super-admin management list to the actor organization', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);
    await service.findAll(
      { page: 1, limit: 20, sort: 'display_order', order: 'asc' },
      actor,
    );
    expect(prisma.galleryImage.findMany.mock.calls[0][0]).toMatchObject({
      where: { organizationId: 5, isDeleted: false },
      orderBy: { display_order: 'asc' },
    });
  });

  it('uses only active, non-deleted images in deterministic public order', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);
    await service.findPublic({ page: 1, limit: 20 });
    expect(prisma.galleryImage.findMany.mock.calls[0][0]).toMatchObject({
      where: expect.objectContaining({ isDeleted: false, isActive: true }),
      orderBy: [{ display_order: 'asc' }, { createdAt: 'desc' }],
    });
  });

  it('enforces ownership before editing image metadata', async () => {
    prisma.galleryImage.findFirst.mockResolvedValue({
      id: 1,
      organizationId: 6,
    });
    ownership.assertAccess.mockImplementation(() => {
      throw new ForbiddenException();
    });
    await expect(service.update(1, {}, actor)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects bulk deletion when not every requested image exists', async () => {
    prisma.galleryImage.findMany.mockResolvedValue([
      { id: 1, organizationId: 5 },
    ]);
    await expect(service.bulkRemove([1, 2], actor)).rejects.toThrow(
      'One or more gallery images were not found.',
    );
  });

  it('checks ownership of every image before reordering', async () => {
    prisma.galleryImage.findMany.mockResolvedValue([
      { id: 1, organizationId: 6 },
    ]);
    ownership.assertAccess.mockImplementation(() => {
      throw new ForbiddenException();
    });
    await expect(
      service.reorder({ images: [{ id: 1, display_order: 1 }] }, actor),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
