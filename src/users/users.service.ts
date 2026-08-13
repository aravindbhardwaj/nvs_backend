import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';

import { PasswordService } from '../auth/services/password.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

const userInclude = {
  organization: {
    select: { id: true, organizationName: true, organizationCode: true },
  },
  organizationType: { select: { id: true, code: true, name: true } },
} satisfies Prisma.UserInclude;

type UserWithOrganization = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(
    dto: CreateUserDto,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    await this.ensureEmailIsUnique(dto.email);
    await this.ensureOrganizationTypeCompatibility(
      dto.organizationId,
      dto.organization_type_id,
    );
    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          mobile: dto.mobile ?? null,
          address: dto.address ?? null,
          organizationId: dto.organizationId,
          organizationTypeId: dto.organization_type_id,
          createdById: actor.id,
          updatedById: actor.id,
        },
        include: userInclude,
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'USER',
          entity: 'USER',
          entityId: createdUser.id,
          action: 'CREATE',
          newValues: this.toAuditValues(createdUser),
        },
      });
      return createdUser;
    });

    return this.toResponse(user);
  }

  async findAll(
    query: GetUsersQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const where = this.buildWhere(query);
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [query.sort]: query.order,
    };
    const [users, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: userInclude,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((user) => this.toResponse(user)),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, isDeleted: false },
      include: userInclude,
    });
    if (!user) throw new NotFoundException('User not found.');
    return this.toResponse(user);
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const existingUser = await this.findActiveUser(id);
    if (dto.email) await this.ensureEmailIsUnique(dto.email, id);
    const organizationId = dto.organizationId ?? existingUser.organizationId;
    const organizationTypeId =
      dto.organization_type_id ?? existingUser.organizationTypeId;
    if (dto.organizationId || dto.organization_type_id)
      await this.ensureOrganizationTypeCompatibility(
        organizationId,
        organizationTypeId,
      );

    const user = await this.prisma.$transaction(async (transaction) => {
      const updatedUser = await transaction.user.update({
        where: { id },
        data: {
          name: dto.name,
          email: dto.email,
          mobile: dto.mobile,
          address: dto.address,
          organizationId: dto.organizationId,
          organizationTypeId: dto.organization_type_id,
          updatedById: actor.id,
        },
        include: userInclude,
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'USER',
          entity: 'USER',
          entityId: id,
          action: 'UPDATE',
          previousValues: this.toAuditValues(existingUser),
          newValues: this.toAuditValues(updatedUser),
        },
      });
      if (
        dto.organization_type_id &&
        dto.organization_type_id !== existingUser.organizationTypeId
      ) {
        await transaction.auditLog.create({
          data: {
            userId: actor.id,
            module: 'USER',
            entity: 'USER',
            entityId: id,
            action: 'ROLE_CHANGE',
            previousValues: {
              organization_type_id: existingUser.organizationTypeId,
            },
            newValues: { organization_type_id: updatedUser.organizationTypeId },
          },
        });
      }
      if (
        dto.organizationId &&
        dto.organizationId !== existingUser.organizationId
      ) {
        await transaction.auditLog.create({
          data: {
            userId: actor.id,
            module: 'USER',
            entity: 'USER',
            entityId: id,
            action: 'ORGANIZATION_CHANGE',
            previousValues: { organizationId: existingUser.organizationId },
            newValues: { organizationId: updatedUser.organizationId },
          },
        });
      }
      return updatedUser;
    });

    return this.toResponse(user);
  }

  async activate(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.updateStatus(id, UserStatus.ACTIVE, 'ACTIVATE', actor);
  }

  async deactivate(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.updateStatus(id, UserStatus.INACTIVE, 'DEACTIVATE', actor);
  }

  async resetPassword(
    id: number,
    dto: ResetUserPasswordDto,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const existingUser = await this.findActiveUser(id);
    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.prisma.$transaction(async (transaction) => {
      const updatedUser = await transaction.user.update({
        where: { id },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          passwordResetRequired: false,
          sessionVersion: { increment: 1 },
          updatedById: actor.id,
        },
        include: userInclude,
      });
      await transaction.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'USER',
          entity: 'USER',
          entityId: id,
          action: 'PASSWORD_RESET',
          previousValues: {
            passwordChangedAt:
              existingUser.passwordChangedAt?.toISOString() ?? null,
          },
          newValues: {
            passwordChangedAt:
              updatedUser.passwordChangedAt?.toISOString() ?? null,
            activeRefreshTokensRevoked: true,
          },
        },
      });
      return updatedUser;
    });

    return this.toResponse(user);
  }

  async remove(id: number, actor: AuthenticatedUser): Promise<UserResponseDto> {
    const user = await this.prisma.$transaction(async (transaction) => {
      const existingUser = await transaction.user.findFirst({
        where: { id, isDeleted: false },
        include: userInclude,
      });
      if (!existingUser) {
        throw new NotFoundException(
          'User not found or has already been deleted.',
        );
      }
      const deletedUser = await transaction.user.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById: actor.id,
          updatedById: actor.id,
        },
        include: userInclude,
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'USER',
          entity: 'USER',
          entityId: id,
          action: 'DELETE',
          previousValues: this.toAuditValues(existingUser),
          newValues: this.toAuditValues(deletedUser),
        },
      });
      return deletedUser;
    });

    return this.toResponse(user);
  }

  async restore(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.$transaction(async (transaction) => {
      const existingUser = await transaction.user.findFirst({
        where: { id, isDeleted: true },
        include: userInclude,
      });
      if (!existingUser) throw new NotFoundException('Deleted user not found.');

      const organization = await transaction.organization.findFirst({
        where: { id: existingUser.organizationId, isDeleted: false },
        select: { id: true },
      });
      if (!organization) {
        throw new ConflictException(
          'User cannot be restored because its organization has been deleted.',
        );
      }

      const restoredUser = await transaction.user.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null,
          deletedById: null,
          updatedById: actor.id,
        },
        include: userInclude,
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'USER',
          entity: 'USER',
          entityId: id,
          action: 'RESTORE',
          previousValues: this.toAuditValues(existingUser),
          newValues: this.toAuditValues(restoredUser),
        },
      });
      return restoredUser;
    });

    return this.toResponse(user);
  }

  private async updateStatus(
    id: number,
    status: UserStatus,
    action: string,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.$transaction(async (transaction) => {
      const existingUser = await transaction.user.findFirst({
        where: { id, isDeleted: false },
        include: userInclude,
      });
      if (!existingUser) throw new NotFoundException('User not found.');
      const updatedUser = await transaction.user.update({
        where: { id },
        data: { status, updatedById: actor.id },
        include: userInclude,
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'USER',
          entity: 'USER',
          entityId: id,
          action,
          previousValues: this.toAuditValues(existingUser),
          newValues: this.toAuditValues(updatedUser),
        },
      });
      return updatedUser;
    });
    return this.toResponse(user);
  }

  private async findActiveUser(id: number): Promise<UserWithOrganization> {
    const user = await this.prisma.user.findFirst({
      where: { id, isDeleted: false },
      include: userInclude,
    });
    if (!user)
      throw new NotFoundException('User not found or has been deleted.');
    return user;
  }

  private async ensureEmailIsUnique(
    email: string,
    excludedId?: number,
  ): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { email, ...(excludedId ? { id: { not: excludedId } } : {}) },
      select: { id: true },
    });
    if (user)
      throw new ConflictException('A user with this email already exists.');
  }

  private async ensureActiveOrganization(id: number): Promise<void> {
    const organization = await this.prisma.organization.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });
    if (!organization) {
      throw new NotFoundException(
        'Organization not found or has been deleted.',
      );
    }
  }

  private async ensureOrganizationTypeCompatibility(
    organizationId: number,
    organizationTypeId: number,
  ): Promise<void> {
    const [organization, organizationType] = await Promise.all([
      this.prisma.organization.findFirst({
        where: { id: organizationId, isDeleted: false },
        select: { organizationTypeId: true },
      }),
      this.prisma.organizationType.findFirst({
        where: { id: organizationTypeId, isActive: true },
        select: { id: true, code: true },
      }),
    ]);
    if (!organization)
      throw new NotFoundException(
        'Organization not found or has been deleted.',
      );
    if (!organizationType)
      throw new NotFoundException('Organization type not found or is inactive.');
    if (
      organizationType.code !== 'SUPER_ADMIN' &&
      organization.organizationTypeId !== organizationTypeId
    )
      throw new ConflictException(
        'User organization type must match the organization type.',
      );
  }

  private buildWhere(query: GetUsersQueryDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {
      isDeleted: query.isDeleted ?? false,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.organization_type_id
        ? { organizationTypeId: query.organization_type_id }
        : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    if (query.search?.trim()) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { email: { contains: query.search.trim(), mode: 'insensitive' } },
        { mobile: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }
    return where;
  }

  private toResponse(user: UserWithOrganization): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      organizationId: user.organizationId,
      organization_type_id: user.organizationTypeId,
      organization: {
        id: user.organization.id,
        name: user.organization.organizationName,
        code: user.organization.organizationCode,
      },
      organization_type: {
        id: user.organizationType.id,
        code: user.organizationType.code,
        name: user.organizationType.name,
      },
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      isDeleted: user.isDeleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toAuditValues(user: UserWithOrganization): Prisma.InputJsonValue {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      organizationId: user.organizationId,
      organization_type_id: user.organizationTypeId,
      organization_type: user.organizationType.code,
      status: user.status,
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      isDeleted: user.isDeleted,
      deletedAt: user.deletedAt?.toISOString() ?? null,
      deletedById: user.deletedById,
    };
  }
}
