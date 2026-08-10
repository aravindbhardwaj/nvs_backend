import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PermissionResponseDto } from '../permissions/dto/permission-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ReplaceRolePermissionsDto } from './dto/replace-role-permissions.dto';
import { RolePermissionsResponseDto } from './dto/role-permissions-response.dto';

@Injectable()
export class RolePermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByRole(role: Role): Promise<RolePermissionsResponseDto> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
      orderBy: { permission: { permissionKey: 'asc' } },
    });

    return {
      role,
      permissions: rolePermissions.map(({ permission }) =>
        this.toPermissionResponse(permission),
      ),
    };
  }

  async replace(
    role: Role,
    dto: ReplaceRolePermissionsDto,
    user: AuthenticatedUser,
  ): Promise<RolePermissionsResponseDto> {
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: dto.permissionIds } },
      orderBy: { permissionKey: 'asc' },
    });

    if (permissions.length !== dto.permissionIds.length) {
      const foundPermissionIds = new Set(permissions.map(({ id }) => id));
      const missingPermissionIds = dto.permissionIds.filter(
        (permissionId) => !foundPermissionIds.has(permissionId),
      );

      throw new BadRequestException(
        `Invalid permission IDs: ${missingPermissionIds.join(', ')}.`,
      );
    }

    const previousPermissions = await this.prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
      orderBy: { permission: { permissionKey: 'asc' } },
    });

    await this.prisma.$transaction(async (transaction) => {
      await transaction.rolePermission.deleteMany({ where: { role } });

      if (dto.permissionIds.length > 0) {
        await transaction.rolePermission.createMany({
          data: dto.permissionIds.map((permissionId) => ({
            role,
            permissionId,
          })),
        });
      }

      await transaction.auditLog.create({
        data: {
          userId: user.id,
          module: 'ROLE_PERMISSION',
          entity: 'ROLE_PERMISSION',
          action: 'UPDATE',
          previousValues: this.toAuditValues(
            role,
            previousPermissions.map(({ permission }) => permission),
          ),
          newValues: this.toAuditValues(role, permissions),
        },
      });
    });

    return {
      role,
      permissions: permissions.map((permission) =>
        this.toPermissionResponse(permission),
      ),
    };
  }

  private toPermissionResponse(
    permission: Prisma.PermissionGetPayload<Record<string, never>>,
  ): PermissionResponseDto {
    return {
      id: permission.id,
      permissionKey: permission.permissionKey,
      module: permission.module,
      action: permission.action,
      description: permission.description,
      createdAt: permission.createdAt,
    };
  }

  private toAuditValues(
    role: Role,
    permissions: Prisma.PermissionGetPayload<Record<string, never>>[],
  ): Prisma.InputJsonValue {
    return {
      role,
      permissions: permissions.map((permission) => ({
        id: permission.id,
        permissionKey: permission.permissionKey,
      })),
    };
  }
}
