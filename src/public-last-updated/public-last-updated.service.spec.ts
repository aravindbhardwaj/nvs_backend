import { NotFoundException } from '@nestjs/common';
import { PublicLastUpdatedService } from './public-last-updated.service';

describe('PublicLastUpdatedService', () => {
  const organizationUuid = '550e8400-e29b-41d4-a716-446655440000';
  const prisma = {
    organization: { findFirst: jest.fn() },
    page: { aggregate: jest.fn() },
    media: { aggregate: jest.fn() },
    banner: { aggregate: jest.fn() },
    galleryImage: { aggregate: jest.fn() },
    gallery: { aggregate: jest.fn() },
  };
  const service = new PublicLastUpdatedService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.organization.findFirst.mockResolvedValue({
      id: 12,
      parentOrganizationId: 7,
      organizationType: { code: 'JNV' },
    });
    for (const model of [
      'page',
      'media',
      'banner',
      'galleryImage',
      'gallery',
    ] as const) {
      prisma[model].aggregate.mockResolvedValue({ _max: {} });
    }
  });

  it('returns the newest visible update or publication date', async () => {
    prisma.page.aggregate.mockResolvedValue({
      _max: {
        updatedAt: new Date('2026-09-01T10:00:00Z'),
        publishedAt: new Date('2026-09-04T10:00:00Z'),
      },
    });
    prisma.media.aggregate.mockResolvedValue({
      _max: { updatedAt: new Date('2026-09-03T10:00:00Z') },
    });
    expect(await service.getLastUpdated(organizationUuid)).toEqual({
      organizationUuid,
      lastUpdatedAt: '4 September 2026',
    });
    expect(prisma.media.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isDeleted: false, isActive: true }),
      }),
    );
    expect(prisma.galleryImage.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: 12, isActive: true }),
      }),
    );
  });

  it('includes a scheduled start when it is the latest visible event', async () => {
    prisma.banner.aggregate.mockResolvedValue({
      _max: { startDate: new Date('2026-09-20T00:00:00Z') },
    });
    expect(await service.getLastUpdated(organizationUuid)).toEqual({
      organizationUuid,
      lastUpdatedAt: '20 September 2026',
    });
  });

  it('returns null if there is no visible content', async () => {
    expect(await service.getLastUpdated(organizationUuid)).toEqual({
      organizationUuid,
      lastUpdatedAt: null,
    });
  });

  it('rejects an unknown organization', async () => {
    prisma.organization.findFirst.mockResolvedValue(null);
    await expect(service.getLastUpdated(organizationUuid)).rejects.toThrow(
      NotFoundException,
    );
  });
});
