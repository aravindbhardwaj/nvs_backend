import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionOverrideDto } from './dto/permission-override.dto';
import { ReplaceUserPermissionsDto } from './dto/replace-user-permissions.dto';
import { UserPermissionOverrideResponseDto } from './dto/user-permission-override-response.dto';
import { UserPermissionsResponseDto } from './dto/user-permissions-response.dto';

const userPermissionWithPermission = {
  permission: true,
} satisfies Prisma.UserPermissionInclude;

type UserPermissionWithPermission = Prisma.UserPermissionGetPayload<{
  include: typeof userPermissionWithPermission;
}>;

@Injectable()
export class UserPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: number): Promise<UserPermissionsResponseDto> {
    await this.ensureUserExists(userId);
    const overrides = await this.findOverrides(userId);

    return this.toResponse(userId, overrides);
  }

  async replace(
    userId: number,
    dto: ReplaceUserPermissionsDto,
    actor: AuthenticatedUser,
  ): Promise<UserPermissionsResponseDto> {
    this.ensureActorIsNotTarget(userId, actor);
    await this.ensureUserExists(userId);
    const permissions = await this.ensurePermissionsExist(dto.permissions);
    const previousOverrides = await this.findOverrides(userId);

    await this.prisma.$transaction(async (transaction) => {
      await transaction.userPermission.deleteMany({ where: { userId } });

      if (dto.permissions.length > 0) {
        await transaction.userPermission.createMany({
          data: dto.permissions.map(({ permissionId, allowed }) => ({
            userId,
            permissionId,
            allowed,
            createdById: actor.id,
          })),
        });
      }

      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'USER_PERMISSION',
          entity: 'USER_PERMISSION',
          entityId: userId,
          action: previousOverrides.length === 0 ? 'CREATE' : 'UPDATE',
          previousValues: this.toAuditValues(userId, previousOverrides),
          newValues: this.toAuditValues(userId, dto.permissions, permissions),
        },
      });
    });

    return this.toResponse(userId, dto.permissions, permissions);
  }

  async remove(
    userId: number,
    actor: AuthenticatedUser,
  ): Promise<UserPermissionsResponseDto> {
    this.ensureActorIsNotTarget(userId, actor);
    await this.ensureUserExists(userId);
    const previousOverrides = await this.findOverrides(userId);

    await this.prisma.$transaction(async (transaction) => {
      await transaction.userPermission.deleteMany({ where: { userId } });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'USER_PERMISSION',
          entity: 'USER_PERMISSION',
          entityId: userId,
          action: 'DELETE',
          previousValues: this.toAuditValues(userId, previousOverrides),
          newValues: this.toAuditValues(userId, []),
        },
      });
    });

    return { userId, permissions: [] };
  }

  private async ensureUserExists(userId: number): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} was not found.`);
    }
  }

  private async ensurePermissionsExist(
    overrides: PermissionOverrideDto[],
  ): Promise<Prisma.PermissionGetPayload<Record<string, never>>[]> {
    const permissionIds = overrides.map(({ permissionId }) => permissionId);
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
      orderBy: { permissionKey: 'asc' },
    });

    if (permissions.length !== permissionIds.length) {
      const foundIds = new Set(permissions.map(({ id }) => id));
      const missingIds = permissionIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `Invalid permission IDs: ${missingIds.join(', ')}.`,
      );
    }

    return permissions;
  }

  private async findOverrides(
    userId: number,
  ): Promise<UserPermissionWithPermission[]> {
    return this.prisma.userPermission.findMany({
      where: { userId },
      include: userPermissionWithPermission,
      orderBy: { permission: { permissionKey: 'asc' } },
    });
  }

  private ensureActorIsNotTarget(
    userId: number,
    actor: AuthenticatedUser,
  ): void {
    if (userId === actor.id) {
      throw new BadRequestException(
        'Users cannot modify their own permission overrides.',
      );
    }
  }

  private toResponse(
    userId: number,
    overrides: UserPermissionWithPermission[] | PermissionOverrideDto[],
    permissions?: Prisma.PermissionGetPayload<Record<string, never>>[],
  ): UserPermissionsResponseDto {
    const permissionById = new Map(
      permissions?.map((permission) => [permission.id, permission]),
    );
    const mapped = overrides.map((override) => {
      const permission =
        'permission' in override
          ? override.permission
          : permissionById.get(override.permissionId);

      if (!permission) {
        throw new BadRequestException(
          'Permission override could not be resolved.',
        );
      }

      return {
        id: permission.id,
        permissionKey: permission.permissionKey,
        module: permission.module,
        action: permission.action,
        description: permission.description,
        createdAt:
          'createdAt' in override ? override.createdAt : permission.createdAt,
        allowed: override.allowed,
      };
    });

    return {
      userId,
      permissions: mapped,
    };
  }

  private toAuditValues(
    userId: number,
    overrides: UserPermissionWithPermission[] | PermissionOverrideDto[],
    permissions?: Prisma.PermissionGetPayload<Record<string, never>>[],
  ): Prisma.InputJsonValue {
    const permissionById = new Map(
      permissions?.map((permission) => [permission.id, permission]),
    );

    return {
      userId,
      overrides: overrides.map((override) => {
        const permission =
          'permission' in override
            ? override.permission
            : permissionById.get(override.permissionId);

        return {
          permissionId: override.permissionId,
          permissionKey: permission?.permissionKey,
          allowed: override.allowed,
        };
      }),
    };
  }
}
