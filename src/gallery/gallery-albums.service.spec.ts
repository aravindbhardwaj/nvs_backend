import { Role } from '@prisma/client';
import { GalleryAlbumsService } from './gallery-albums.service';

describe('GalleryAlbumsService', () => {
  const prisma = {
    organization: { findFirst: jest.fn(), findUnique: jest.fn() },
    gallery: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn(),
  };
  const ownership = { assertAccess: jest.fn() };
  const service = new GalleryAlbumsService(prisma as never, ownership);
  const actor = {
    id: 1,
    email: 'hq@example.com',
    role: Role.HEADQUARTER,
    organizationId: 10,
    organizationTypeId: 1,
  };

  beforeEach(() => jest.clearAllMocks());

  it('creates a gallery for the actor organization with gallery-level visibility', async () => {
    prisma.organization.findFirst.mockResolvedValue({ id: 10 });
    prisma.gallery.create.mockResolvedValue({
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      organizationId: 10,
      titleEnglish: 'Events',
      titleHindi: null,
      descriptionEnglish: null,
      descriptionHindi: null,
      displayOrder: 0,
      isActive: true,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { images: 0 },
    });

    const result = await service.create({ titleEnglish: 'Events' }, actor);

    expect(ownership.assertAccess).toHaveBeenCalledWith(10, actor);
    expect(prisma.gallery.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ titleEnglish: 'Events' }),
      }),
    );
  });
});
