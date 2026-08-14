import { BadRequestException } from '@nestjs/common';

import { MenusService } from './menus.service';

describe('MenusService', () => {
  const service = new MenusService({} as never);

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
        displayOrder: 1,
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
        displayOrder: 1,
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
        displayOrder: 1,
      },
    ];
    const tree = (service as any).toTree(menus);
    expect(tree[0].children[0].children[0].external_url).toBe(
      'https://example.com',
    );
    expect(tree[0].children[0].children[0].link_target).toBe(2);
  });
});
