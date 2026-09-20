import { Role } from '@prisma/client';

import { REQUIRED_PERMISSIONS_KEY } from '../auth/decorators/require-permission.decorator';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { ROLE_PERMISSIONS } from '../../prisma/seed/constants';
import { LeadershipController } from './leadership.controller';

describe('LeadershipController', () => {
  it('restricts all leader mutations to SUPER_ADMIN', () => {
    const mutationMethods = [
      'create',
      'updateByUuid',
      'replaceImageByUuid',
      'activateByUuid',
      'deactivateByUuid',
      'removeByUuid',
      'reorder',
      'update',
      'replaceImage',
      'activate',
      'deactivate',
      'remove',
    ] as const;

    for (const method of mutationMethods) {
      expect(
        Reflect.getMetadata(ROLES_KEY, LeadershipController.prototype[method]),
      ).toEqual([Role.SUPER_ADMIN]);
    }

    expect(
      Reflect.getMetadata(
        REQUIRED_PERMISSIONS_KEY,
        LeadershipController.prototype.create,
      ),
    ).toEqual(['LEADERSHIP_CREATE']);
  });

  it('seeds leadership mutation permissions only for SUPER_ADMIN', () => {
    const mutationPermissions = [
      'LEADERSHIP_CREATE',
      'LEADERSHIP_UPDATE',
      'LEADERSHIP_DELETE',
    ];

    expect(ROLE_PERMISSIONS[Role.SUPER_ADMIN]).toEqual(
      expect.arrayContaining(mutationPermissions),
    );

    for (const role of [Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV]) {
      for (const permission of mutationPermissions) {
        expect(ROLE_PERMISSIONS[role]).not.toContain(permission);
      }
      expect(ROLE_PERMISSIONS[role]).toContain('LEADERSHIP_VIEW');
    }
  });
});
