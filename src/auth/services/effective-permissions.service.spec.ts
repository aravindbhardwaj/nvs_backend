import { Role } from '@prisma/client';

import { EffectivePermissionsService } from './effective-permissions.service';

describe('EffectivePermissionsService', () => {
  it('applies user overrides after role permissions', async () => {
    const prisma = {
      rolePermission: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { permission: { permissionKey: 'PAGE_VIEW' } },
            { permission: { permissionKey: 'PAGE_UPDATE' } },
          ]),
      },
      userPermission: {
        findMany: jest.fn().mockResolvedValue([
          { permission: { permissionKey: 'PAGE_UPDATE' }, allowed: false },
          { permission: { permissionKey: 'MEDIA_VIEW' }, allowed: true },
        ]),
      },
    };
    const service = new EffectivePermissionsService(prisma as never);

    await expect(service.resolve(42, Role.JNV)).resolves.toEqual(
      new Set(['PAGE_VIEW', 'MEDIA_VIEW']),
    );
    expect(prisma.rolePermission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { role: Role.JNV } }),
    );
    expect(prisma.userPermission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 42 } }),
    );
  });
});
