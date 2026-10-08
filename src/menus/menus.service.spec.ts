import { BadRequestException } from '@nestjs/common';

import { MenusService } from './menus.service';

describe('MenusService', () => {
  const prisma = {
    organizationType: { findFirst: jest.fn() },
    organization: { findFirst: jest.fn() },
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

  it('allows page_url with a destination', async () => {
    await expect(
      (service as any).validateConfiguration({
        content_type_id: 1,
        page_url: '/about-us',
      }),
    ).resolves.toBeUndefined();
  });

  it('treats enabled tabular_type as a destination', async () => {
    await expect(
      (service as any).validateConfiguration({
        external_url: 'https://example.com',
        tabular_type: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('preserves null so an existing relation destination can be cleared', async () => {
    await expect(
      (service as any).resolveContentTypeId(null, undefined),
    ).resolves.toBeNull();
    await expect(
      (service as any).resolveMediaTypeId(undefined, null),
    ).resolves.toBeNull();
  });

  it('builds an ordered multi-level navigation tree', () => {
    const menus = [
      {
        id: 1,
        uuid: 'parent-uuid',
        organizationTypeId: 1,
        organizationType: {
          uuid: 'headquarters-uuid',
          code: 'HEADQUARTER',
          name: 'Headquarters',
        },
        showOnAllOrganizations: true,
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
        uuid: 'child-uuid',
        organizationTypeId: 1,
        organizationType: {
          uuid: 'headquarters-uuid',
          code: 'HEADQUARTER',
          name: 'Headquarters',
        },
        showOnAllOrganizations: true,
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
        uuid: 'grandchild-uuid',
        organizationTypeId: 1,
        organizationType: {
          uuid: 'headquarters-uuid',
          code: 'HEADQUARTER',
          name: 'Headquarters',
        },
        showOnAllOrganizations: true,
        parentMenuId: 2,
        titleEnglish: 'Grandchild',
        titleHindi: null,
        contentTypeId: null,
        mediaTypeId: null,
        externalUrl: 'https://example.com',
        tabularType: true,
        tabularData: 'Example table data',
        linkTarget: 2,
        display_order: 1,
      },
    ];
    const tree = (service as any).toTree(
      menus,
      3,
      'headquarters-organization-uuid',
    );
    expect(tree[0]).toEqual(
      expect.objectContaining({
        organization_uuid: 'headquarters-organization-uuid',
        organization_type_uuid: 'headquarters-uuid',
        source_organization_type: {
          uuid: 'headquarters-uuid',
          code: 'HEADQUARTER',
          name: 'Headquarters',
        },
        show_on_all_organizations: true,
        is_shared: true,
      }),
    );
    expect(tree[0].children[0].is_shared).toBe(true);
    expect(tree[0].children[0].children[0].external_url).toBe(
      'https://example.com',
    );
    expect(tree[0].children[0].children[0].link_target).toBe(2);
    expect(tree[0].children[0].children[0].tabular_type).toBe(true);
    expect(tree[0].children[0].children[0].tabular_data).toBe(
      'Example table data',
    );
  });

  it('includes shared Headquarters and Regional Office menus in JNV navigation', async () => {
    prisma.organizationType.findFirst.mockResolvedValue({
      id: 4,
      code: 'JNV',
      isActive: true,
    });
    prisma.menu.findMany.mockResolvedValue([]);

    await service.navigation({ organization_type_id: 4, menu_location: 1 });

    expect(prisma.menu.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
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
      }),
    );
  });

  it('returns the Headquarters organization UUID for shared Headquarters menus', async () => {
    prisma.organizationType.findFirst.mockResolvedValue({
      id: 3,
      code: 'REGIONAL_OFFICE',
      isActive: true,
    });
    prisma.menu.findMany.mockResolvedValue([
      {
        id: 1,
        uuid: 'menu-uuid',
        organizationTypeId: 1,
        organizationType: {
          uuid: 'headquarters-type-uuid',
          code: 'HEADQUARTER',
          name: 'Headquarters',
        },
        showOnAllOrganizations: true,
        parentMenuId: null,
        titleEnglish: 'About Us',
        titleHindi: null,
        contentTypeId: null,
        contentType: null,
        mediaTypeId: null,
        mediaType: null,
        externalUrl: null,
        pageUrl: '/about-us',
        tabularType: false,
        tabularData: null,
        linkTarget: 1,
        display_order: 1,
      },
    ]);
    prisma.organization.findFirst.mockResolvedValue({
      uuid: 'headquarters-organization-uuid',
    });

    const navigation = await service.navigation({
      organization_type_id: 3,
      menu_location: 1,
    });

    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: {
        isDeleted: false,
        isFunctional: true,
        organizationType: { code: 'HEADQUARTER', isActive: true },
      },
      select: { uuid: true },
    });
    expect(navigation[0]).toEqual(
      expect.objectContaining({
        organization_uuid: 'headquarters-organization-uuid',
        is_shared: true,
      }),
    );
  });

  it('returns UUID and display details for menu relationships', () => {
    const response = (service as any).toResponse({
      id: 10,
      uuid: 'menu-uuid',
      organizationTypeId: 3,
      organizationType: {
        uuid: 'organization-type-uuid',
        code: 'REGIONAL_OFFICE',
        name: 'Regional Office',
      },
      menuLocation: 1,
      parentMenuId: 5,
      parentMenu: {
        uuid: 'parent-menu-uuid',
        titleEnglish: 'Parent',
        titleHindi: 'मूल',
      },
      titleEnglish: 'Child',
      titleHindi: 'चाइल्ड',
      contentTypeId: 2,
      contentType: {
        uuid: 'content-type-uuid',
        nameEnglish: 'Page',
        nameHindi: 'पृष्ठ',
      },
      mediaTypeId: null,
      mediaType: null,
      externalUrl: null,
      pageUrl: null,
      tabularType: null,
      tabularData: null,
      linkTarget: 1,
      display_order: 1,
      isActive: true,
      showOnAllOrganizations: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      isDeleted: false,
    });

    expect(response).toEqual(
      expect.objectContaining({
        organization_type_uuid: 'organization-type-uuid',
        organization_type: {
          uuid: 'organization-type-uuid',
          code: 'REGIONAL_OFFICE',
          name: 'Regional Office',
        },
        parent_menu_uuid: 'parent-menu-uuid',
        parent_menu: {
          uuid: 'parent-menu-uuid',
          title_english: 'Parent',
          title_hindi: 'मूल',
        },
        content_type_uuid: 'content-type-uuid',
        media_type_uuid: null,
      }),
    );
  });

  it.each([
    { id: 2, code: 'NLI' },
    { id: 3, code: 'REGIONAL_OFFICE' },
  ])(
    'includes only shared Headquarters menus in $code navigation',
    async (type) => {
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
    },
  );

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
