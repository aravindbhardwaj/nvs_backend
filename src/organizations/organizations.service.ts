import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Organization, OrganizationType, Prisma } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { GetOrganizationsQueryDto } from './dto/get-organizations-query.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const organizationInclude = {
  parentOrganization: { select: { id: true, organizationName: true } },
  region: { select: { id: true, regionName: true } },
  state: { select: { id: true, stateName: true } },
} satisfies Prisma.OrganizationInclude;

type OrganizationWithRelations = Prisma.OrganizationGetPayload<{
  include: typeof organizationInclude;
}>;

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateOrganizationDto,
    actor: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    await this.ensureValuesAreUnique(
      dto.organizationName,
      dto.organizationCode,
    );
    const normalized = await this.validateHierarchy(dto);

    const organization = await this.prisma.$transaction(async (transaction) => {
      const createdOrganization = await transaction.organization.create({
        data: { ...normalized, createdById: actor.id, updatedById: actor.id },
        include: organizationInclude,
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'ORGANIZATION',
          entity: 'ORGANIZATION',
          entityId: createdOrganization.id,
          action: 'CREATE',
          newValues: this.toAuditValues(createdOrganization),
        },
      });
      return createdOrganization;
    });

    return this.toResponse(organization);
  }

  async findAll(
    query: GetOrganizationsQueryDto,
  ): Promise<PaginatedResponseDto<OrganizationResponseDto>> {
    const { page, limit, sort, order } = query;
    const where = this.buildWhere(query);
    const orderBy: Prisma.OrganizationOrderByWithRelationInput = {
      [sort]: order,
    };
    const [organizations, totalItems] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        include: organizationInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      items: organizations.map((organization) => this.toResponse(organization)),
      meta: PaginationUtil.buildMeta(page, limit, totalItems),
    };
  }

  async findOne(id: number): Promise<OrganizationResponseDto> {
    const organization = await this.prisma.organization.findFirst({
      where: { id, isDeleted: false },
      include: organizationInclude,
    });
    if (!organization) throw new NotFoundException('Organization not found.');
    return this.toResponse(organization);
  }

  async update(
    id: number,
    dto: UpdateOrganizationDto,
    actor: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    const existingOrganization = await this.findActiveOrganization(id);
    await this.ensureValuesAreUnique(
      dto.organizationName,
      dto.organizationCode,
      id,
    );
    const normalized = await this.validateHierarchy(dto, id);
    await this.ensureTypeChangeDoesNotInvalidateChildren(
      existingOrganization,
      dto.organizationType,
    );

    const organization = await this.prisma.$transaction(async (transaction) => {
      const updatedOrganization = await transaction.organization.update({
        where: { id },
        data: { ...normalized, updatedById: actor.id },
        include: organizationInclude,
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'ORGANIZATION',
          entity: 'ORGANIZATION',
          entityId: id,
          action: 'UPDATE',
          previousValues: this.toAuditValues(existingOrganization),
          newValues: this.toAuditValues(updatedOrganization),
        },
      });
      return updatedOrganization;
    });
    return this.toResponse(organization);
  }

  async remove(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.prisma.$transaction(async (transaction) => {
      const existingOrganization = await transaction.organization.findFirst({
        where: { id, isDeleted: false },
        include: organizationInclude,
      });
      if (!existingOrganization)
        throw new NotFoundException(
          'Organization not found or has already been deleted.',
        );
      const [users, children, pages, media] = await Promise.all([
        transaction.user.count({ where: { organizationId: id } }),
        transaction.organization.count({ where: { parentOrganizationId: id } }),
        transaction.page.count({ where: { organizationId: id } }),
        transaction.media.count({ where: { organizationId: id } }),
      ]);
      if (users || children || pages || media) {
        const dependencies = [
          users && 'users',
          children && 'child organizations',
          pages && 'pages',
          media && 'media',
        ]
          .filter(Boolean)
          .join(', ');
        throw new ConflictException(
          `Organization cannot be deleted because it contains ${dependencies}.`,
        );
      }
      const deletedOrganization = await transaction.organization.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById: actor.id,
          updatedById: actor.id,
        },
        include: organizationInclude,
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'ORGANIZATION',
          entity: 'ORGANIZATION',
          entityId: id,
          action: 'DELETE',
          previousValues: this.toAuditValues(existingOrganization),
          newValues: this.toAuditValues(deletedOrganization),
        },
      });
      return deletedOrganization;
    });
    return this.toResponse(organization);
  }

  async restore(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.prisma.$transaction(async (transaction) => {
      const existingOrganization = await transaction.organization.findFirst({
        where: { id, isDeleted: true },
        include: organizationInclude,
      });
      if (!existingOrganization)
        throw new NotFoundException('Deleted organization not found.');
      await this.validateRestoration(existingOrganization);
      const restoredOrganization = await transaction.organization.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null,
          deletedById: null,
          updatedById: actor.id,
        },
        include: organizationInclude,
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'ORGANIZATION',
          entity: 'ORGANIZATION',
          entityId: id,
          action: 'RESTORE',
          previousValues: this.toAuditValues(existingOrganization),
          newValues: this.toAuditValues(restoredOrganization),
        },
      });
      return restoredOrganization;
    });
    return this.toResponse(organization);
  }

  private async validateHierarchy(
    dto: CreateOrganizationDto,
    organizationId?: number,
  ): Promise<Prisma.OrganizationUncheckedCreateInput> {
    const { organizationType, parentOrganizationId, regionId, stateId } = dto;
    if (parentOrganizationId === organizationId)
      throw new BadRequestException(
        'An organization cannot be its own parent.',
      );
    if (
      organizationType === OrganizationType.HEADQUARTER ||
      organizationType === OrganizationType.NLI
    ) {
      if (parentOrganizationId || regionId || stateId)
        throw new BadRequestException(
          `${organizationType} organizations cannot have a parent, region, or state.`,
        );
      if (organizationType === OrganizationType.HEADQUARTER) {
        const headquarters = await this.prisma.organization.findFirst({
          where: {
            organizationType,
            isDeleted: false,
            ...(organizationId ? { id: { not: organizationId } } : {}),
          },
          select: { id: true },
        });
        if (headquarters)
          throw new ConflictException(
            'Only one Headquarters organization may exist.',
          );
      }
      return {
        organizationName: dto.organizationName,
        organizationCode: dto.organizationCode,
        organizationType,
        address: dto.address ?? null,
        parentOrganizationId: null,
        regionId: null,
        stateId: null,
      };
    }
    if (!parentOrganizationId)
      throw new BadRequestException(
        `${organizationType} organizations must reference a parent organization.`,
      );
    const parent = await this.prisma.organization.findFirst({
      where: { id: parentOrganizationId, isDeleted: false },
    });
    if (!parent)
      throw new NotFoundException(
        'Parent organization not found or has been deleted.',
      );
    if (organizationType === OrganizationType.REGIONAL_OFFICE) {
      if (parent.organizationType !== OrganizationType.HEADQUARTER)
        throw new BadRequestException(
          'A Regional Office parent must be Headquarters.',
        );
      if (!regionId)
        throw new BadRequestException(
          'A Regional Office must reference a region.',
        );
      if (stateId)
        throw new BadRequestException(
          'A Regional Office must not reference a state.',
        );
      await this.ensureActiveRegion(regionId);
      return {
        organizationName: dto.organizationName,
        organizationCode: dto.organizationCode,
        organizationType,
        address: dto.address ?? null,
        parentOrganizationId,
        regionId,
        stateId: null,
      };
    }
    if (parent.organizationType !== OrganizationType.REGIONAL_OFFICE)
      throw new BadRequestException('A JNV parent must be a Regional Office.');
    if (!stateId)
      throw new BadRequestException('A JNV must reference a state.');
    if (regionId && regionId !== parent.regionId)
      throw new BadRequestException(
        'A JNV region must match its Regional Office region.',
      );
    if (!parent.regionId)
      throw new BadRequestException(
        'The parent Regional Office must reference a region.',
      );
    await this.ensureActiveState(stateId);
    return {
      organizationName: dto.organizationName,
      organizationCode: dto.organizationCode,
      organizationType,
      address: dto.address ?? null,
      parentOrganizationId,
      regionId: parent.regionId,
      stateId,
    };
  }

  private async validateRestoration(
    organization: OrganizationWithRelations,
  ): Promise<void> {
    if (organization.organizationType === OrganizationType.HEADQUARTER) {
      const headquarters = await this.prisma.organization.findFirst({
        where: {
          organizationType: OrganizationType.HEADQUARTER,
          isDeleted: false,
          id: { not: organization.id },
        },
        select: { id: true },
      });
      if (headquarters)
        throw new ConflictException(
          'Organization cannot be restored because a Headquarters organization already exists.',
        );
      return;
    }
    if (organization.organizationType === OrganizationType.NLI) return;
    if (
      !organization.parentOrganizationId ||
      !organization.parentOrganization ||
      organization.parentOrganizationId !== organization.parentOrganization.id
    )
      throw new ConflictException(
        'Organization cannot be restored because its parent organization is unavailable.',
      );
    const parent = await this.prisma.organization.findFirst({
      where: { id: organization.parentOrganizationId, isDeleted: false },
    });
    if (!parent)
      throw new ConflictException(
        'Organization cannot be restored because its parent organization has been deleted.',
      );
    if (organization.organizationType === OrganizationType.REGIONAL_OFFICE) {
      if (
        parent.organizationType !== OrganizationType.HEADQUARTER ||
        !organization.regionId
      )
        throw new ConflictException(
          'Organization cannot be restored because its hierarchy is invalid.',
        );
      await this.ensureActiveRegion(organization.regionId);
      return;
    }
    if (
      parent.organizationType !== OrganizationType.REGIONAL_OFFICE ||
      !organization.stateId ||
      organization.regionId !== parent.regionId
    )
      throw new ConflictException(
        'Organization cannot be restored because its hierarchy is invalid.',
      );
    await this.ensureActiveState(organization.stateId);
  }

  private async ensureTypeChangeDoesNotInvalidateChildren(
    existing: Organization,
    nextType: OrganizationType,
  ): Promise<void> {
    if (existing.organizationType === nextType) return;
    const children = await this.prisma.organization.count({
      where: { parentOrganizationId: existing.id, isDeleted: false },
    });
    if (children)
      throw new ConflictException(
        'Organization type cannot be changed while active child organizations exist.',
      );
  }

  private async ensureActiveRegion(id: number): Promise<void> {
    const region = await this.prisma.region.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });
    if (!region)
      throw new NotFoundException('Region not found or has been deleted.');
  }

  private async ensureActiveState(id: number): Promise<void> {
    const state = await this.prisma.state.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });
    if (!state)
      throw new NotFoundException('State not found or has been deleted.');
  }

  private async findActiveOrganization(id: number): Promise<Organization> {
    const organization = await this.prisma.organization.findFirst({
      where: { id, isDeleted: false },
    });
    if (!organization)
      throw new NotFoundException(
        'Organization not found or has been deleted.',
      );
    return organization;
  }

  private async ensureValuesAreUnique(
    name: string,
    code: string,
    excludedId?: number,
  ): Promise<void> {
    const duplicate = await this.prisma.organization.findFirst({
      where: {
        ...(excludedId ? { id: { not: excludedId } } : {}),
        OR: [{ organizationName: name }, { organizationCode: code }],
      },
      select: { id: true },
    });
    if (duplicate)
      throw new ConflictException(
        'An organization with the same name or code already exists.',
      );
  }

  private buildWhere(
    query: GetOrganizationsQueryDto,
  ): Prisma.OrganizationWhereInput {
    const where: Prisma.OrganizationWhereInput = {
      isDeleted: query.isDeleted ?? false,
      ...(query.organizationType
        ? { organizationType: query.organizationType }
        : {}),
      ...(query.regionId ? { regionId: query.regionId } : {}),
      ...(query.stateId ? { stateId: query.stateId } : {}),
      ...(query.parentOrganizationId
        ? { parentOrganizationId: query.parentOrganizationId }
        : {}),
    };
    if (query.search?.trim())
      where.OR = [
        {
          organizationName: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
        {
          organizationCode: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    return where;
  }

  private toResponse(
    organization: OrganizationWithRelations,
  ): OrganizationResponseDto {
    return {
      id: organization.id,
      organizationName: organization.organizationName,
      organizationCode: organization.organizationCode,
      organizationType: organization.organizationType,
      parentOrganizationId: organization.parentOrganizationId,
      regionId: organization.regionId,
      stateId: organization.stateId,
      address: organization.address,
      parentOrganization: organization.parentOrganization
        ? {
            id: organization.parentOrganization.id,
            name: organization.parentOrganization.organizationName,
          }
        : null,
      region: organization.region
        ? { id: organization.region.id, name: organization.region.regionName }
        : null,
      state: organization.state
        ? { id: organization.state.id, name: organization.state.stateName }
        : null,
      isDeleted: organization.isDeleted,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }

  private toAuditValues(organization: Organization): Prisma.InputJsonValue {
    return {
      id: organization.id,
      organizationName: organization.organizationName,
      organizationCode: organization.organizationCode,
      organizationType: organization.organizationType,
      parentOrganizationId: organization.parentOrganizationId,
      regionId: organization.regionId,
      stateId: organization.stateId,
      address: organization.address,
      createdAt: organization.createdAt.toISOString(),
      updatedAt: organization.updatedAt.toISOString(),
      createdById: organization.createdById,
      updatedById: organization.updatedById,
      isDeleted: organization.isDeleted,
      deletedAt: organization.deletedAt?.toISOString() ?? null,
      deletedById: organization.deletedById,
    };
  }
}
