import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  const context = (user?: {
    id: number;
    email: string;
    role: Role;
    organizationId: number;
    organizationTypeId: number;
  }) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as never;

  it('allows Super Admin without consulting mutable permissions', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['MENU_VIEW']),
    };
    const effectivePermissions = { resolve: jest.fn() };
    const guard = new PermissionsGuard(
      reflector as never,
      effectivePermissions as never,
    );

    await expect(
      guard.canActivate(
        context({
          id: 1,
          email: 'super.admin@nvs.gov.in',
          role: Role.SUPER_ADMIN,
          organizationId: 1,
          organizationTypeId: 5,
        }),
      ),
    ).resolves.toBe(true);

    expect(effectivePermissions.resolve).not.toHaveBeenCalled();
  });

  it('denies a regular user who lacks a required permission', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['MENU_VIEW']),
    };
    const effectivePermissions = {
      resolve: jest.fn().mockResolvedValue(new Set()),
    };
    const guard = new PermissionsGuard(
      reflector as never,
      effectivePermissions as never,
    );

    await expect(
      guard.canActivate(
        context({
          id: 2,
          email: 'user@nvs.gov.in',
          role: Role.HEADQUARTER,
          organizationId: 1,
          organizationTypeId: 1,
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
