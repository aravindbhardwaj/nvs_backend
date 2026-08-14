import { Role } from '@prisma/client';

import { REQUIRED_PERMISSIONS_KEY } from '../auth/decorators/require-permission.decorator';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { MenusController } from './menus.controller';

describe('MenusController', () => {
  it('restricts menu management to SUPER_ADMIN and requires menu permissions', () => {
    expect(Reflect.getMetadata(ROLES_KEY, MenusController)).toEqual([
      Role.SUPER_ADMIN,
    ]);
    expect(
      Reflect.getMetadata(
        REQUIRED_PERMISSIONS_KEY,
        MenusController.prototype.create,
      ),
    ).toEqual(['MENU_CREATE']);
    expect(
      Reflect.getMetadata(
        REQUIRED_PERMISSIONS_KEY,
        MenusController.prototype.update,
      ),
    ).toEqual(['MENU_UPDATE']);
  });
});
