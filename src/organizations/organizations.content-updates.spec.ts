import { Role } from '@prisma/client';

import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

describe('Organization website content updates', () => {
  it('allows only Super Admin and Headquarters roles', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        OrganizationsController.prototype.findWebsiteContentUpdates,
      ),
    ).toEqual([Role.SUPER_ADMIN, Role.HEADQUARTER]);
  });

  it('returns the latest content update for each organization', async () => {
    const prisma = {
      $transaction: jest.fn().mockResolvedValue([
        [
          {
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            organizationName: 'Test Organization',
            createdAt: new Date('2026-01-01T00:00:00Z'),
            organizationType: { name: 'JNV' },
            pages: [{ updatedAt: new Date('2026-09-10T00:00:00Z') }],
            media: [{ updatedAt: new Date('2026-09-15T00:00:00Z') }],
            banners: [],
            galleries: [{ updatedAt: new Date('2026-09-12T00:00:00Z') }],
            galleryImages: [{ updatedAt: new Date('2026-09-20T00:00:00Z') }],
          },
        ],
        1,
      ]),
      organization: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    const service = new OrganizationsService(prisma as never);

    await expect(
      service.findWebsiteContentUpdates({
        page: 1,
        limit: 20,
        sort: 'createdAt',
        order: 'desc',
      } as never),
    ).resolves.toEqual({
      items: [
        {
          organizationName: 'Test Organization',
          organizationUuid: '550e8400-e29b-41d4-a716-446655440000',
          organizationTypeName: 'JNV',
          content_updated_date: new Date('2026-09-10T00:00:00Z'),
          media_updated_date: new Date('2026-09-15T00:00:00Z'),
          banner_updated_date: new Date('2026-01-01T00:00:00Z'),
          gallery_updated_date: new Date('2026-09-20T00:00:00Z'),
          lastUpdatedAt: new Date('2026-09-20T00:00:00Z'),
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        totalItems: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  });

  it('uses the organization creation date when it has no content', async () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const prisma = {
      $transaction: jest.fn().mockResolvedValue([
        [
          {
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            organizationName: 'Empty Organization',
            createdAt,
            organizationType: { name: 'Regional Office' },
            pages: [],
            media: [],
            banners: [],
            galleries: [],
            galleryImages: [],
          },
        ],
        1,
      ]),
      organization: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    const service = new OrganizationsService(prisma as never);

    const result = await service.findWebsiteContentUpdates({
      page: 1,
      limit: 20,
      sort: 'createdAt',
      order: 'desc',
    } as never);

    expect(result.items[0]).toEqual(
      expect.objectContaining({
        content_updated_date: createdAt,
        media_updated_date: createdAt,
        banner_updated_date: createdAt,
        gallery_updated_date: createdAt,
        lastUpdatedAt: createdAt,
      }),
    );
  });
});
