import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EffectivePermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(userId: number, role: Role): Promise<Set<string>> {
    const [rolePermissions, userPermissionOverrides] = await Promise.all([
      this.prisma.rolePermission.findMany({
        where: { role },
        select: { permission: { select: { permissionKey: true } } },
      }),
      this.prisma.userPermission.findMany({
        where: { userId },
        select: {
          allowed: true,
          permission: { select: { permissionKey: true } },
        },
      }),
    ]);

    const permissions = new Set(
      rolePermissions.map(({ permission }) => permission.permissionKey),
    );

    for (const { permission, allowed } of userPermissionOverrides) {
      if (allowed) {
        permissions.add(permission.permissionKey);
      } else {
        permissions.delete(permission.permissionKey);
      }
    }

    return permissions;
  }
}
