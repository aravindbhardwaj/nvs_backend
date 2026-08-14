import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateMenuDto } from './create-menu.dto';

const validMenu = {
  organization_type_id: 1,
  menu_location: 1,
  title_english: 'Circulars',
};

describe('CreateMenuDto', () => {
  it.each([1, 2])('accepts menu location %i', async (menu_location) => {
    expect(
      await validate(
        plainToInstance(CreateMenuDto, { ...validMenu, menu_location }),
      ),
    ).toHaveLength(0);
  });

  it.each([1, 2])('accepts link target %i', async (link_target) => {
    expect(
      await validate(
        plainToInstance(CreateMenuDto, { ...validMenu, link_target }),
      ),
    ).toHaveLength(0);
  });

  it('rejects invalid numeric enums and unsafe external URLs', async () => {
    const invalid = plainToInstance(CreateMenuDto, {
      ...validMenu,
      menu_location: 3,
      link_target: 3,
      external_url: 'javascript:alert(1)',
    });
    expect(await validate(invalid)).not.toHaveLength(0);
  });
});
