import { BadRequestException } from '@nestjs/common';

import { MenusService } from './menus.service';

describe('MenusService', () => {
  const prisma = {
    organizationType: { findFirst: jest.fn() },
    menu: { findMany: jest.fn() },
  };
  const service = new MenusService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('rejects ambiguous destinations', async () => {
    await expect(
      (service as any).validateConfiguration({
        content_type_id: 1,
        media_type_id: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows a parent menu with no destination', async () => {
    await expect(
      (service as any).validateConfiguration({}),
    ).resolves.toBeUndefined();
  });

  it('builds an ordered multi-level navigation tree', () => {
    const menus = [
      {
        id: 1,
        parentMenuId: null,
        titleEnglish: 'Parent',
        titleHindi: null,
        contentTypeId: null,
        mediaTypeId: null,
        externalUrl: null,
        linkTarget: 1,
        display_order: 1,
      },
      {
        id: 2,
        parentMenuId: 1,
        titleEnglish: 'Child',
        titleHindi: null,
        contentTypeId: 5,
        mediaTypeId: null,
        externalUrl: null,
        linkTarget: 1,
        display_order: 1,
      },
      {
        id: 3,
        parentMenuId: 2,
        titleEnglish: 'Grandchild',
        titleHindi: null,
        contentTypeId: null,
        mediaTypeId: null,
        externalUrl: 'https://example.com',
        linkTarget: 2,
        display_order: 1,
      },
    ];
    const tree = (service as any).toTree(menus);
    expect(tree[0].children[0].children[0].external_url).toBe(
      'https://example.com',
    );
    expect(tree[0].children[0].children[0].link_target).toBe(2);
  });

  it('includes shared Headquarters and Regional Office menus in JNV navigation', async () => {
    prisma.organizationType.findFirst.mockResolvedValue({
      id: 4,
      code: 'JNV',
      isActive: true,
    });
    prisma.menu.findMany.mockResolvedValue([]);

    await service.navigation({ organization_type_id: 4, menu_location: 1 });

    expect(prisma.menu.findMany).toHaveBeenCalledWith({
      where: {
        menuLocation: 1,
        isActive: true,
        isDeleted: false,
        OR: [
          { organizationTypeId: 4 },
          {
            organizationType: {
              code: { in: ['HEADQUARTER', 'REGIONAL_OFFICE'] },
            },
            showOnAllOrganizations: true,
          },
        ],
      },
      orderBy: [
        { display_order: 'asc' },
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
    });
  });

  it.each([
    { id: 2, code: 'NLI' },
    { id: 3, code: 'REGIONAL_OFFICE' },
  ])('includes only shared Headquarters menus in $code navigation', async (type) => {
    prisma.organizationType.findFirst.mockResolvedValue({
      ...type,
      isActive: true,
    });
    prisma.menu.findMany.mockResolvedValue([]);

    await service.navigation({
      organization_type_id: type.id,
      menu_location: 1,
    });

    expect(prisma.menu.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          menuLocation: 1,
          isActive: true,
          isDeleted: false,
          OR: [
            { organizationTypeId: type.id },
            {
              organizationType: { code: { in: ['HEADQUARTER'] } },
              showOnAllOrganizations: true,
            },
          ],
        },
      }),
    );
  });

  it('keeps Headquarters navigation limited to Headquarters menus', async () => {
    prisma.organizationType.findFirst.mockResolvedValue({
      id: 1,
      code: 'HEADQUARTER',
      isActive: true,
    });
    prisma.menu.findMany.mockResolvedValue([]);

    await service.navigation({ organization_type_id: 1, menu_location: 2 });

    expect(prisma.menu.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          menuLocation: 2,
          isActive: true,
          isDeleted: false,
          organizationTypeId: 1,
        },
      }),
    );
  });
});
