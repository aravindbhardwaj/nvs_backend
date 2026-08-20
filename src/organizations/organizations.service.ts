import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Organization, Prisma } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { GetOrganizationsQueryDto } from './dto/get-organizations-query.dto';
import { GetPublicJnvsQueryDto } from './dto/get-public-jnvs-query.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { PublicJnvResponseDto } from './dto/public-jnv-response.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const organizationInclude = {
  organizationType: { select: { id: true, code: true, name: true } },
  parentOrganization: {
    select: {
      id: true,
      organizationName: true,
      organizationType: { select: { code: true } },
    },
  },
  region: { select: { id: true, regionName: true } },
  state: { select: { id: true, stateName: true } },
  district: { select: { id: true, districtName: true } },
} satisfies Prisma.OrganizationInclude;

const organizationTypeCodes = {
  headquarters: 'HEADQUARTER',
  nli: 'NLI',
  regionalOffice: 'REGIONAL_OFFICE',
  jnv: 'JNV',
} as const;

const JNV_ORGANIZATION_TYPE_ID = 4;

const publicJnvSelect = {
  id: true,
  organizationName: true,
  organizationHindiName: true,
  organizationCode: true,
  address: true,
  estdYear: true,
  studentsCount: true,
  region: { select: { regionCode: true, regionName: true } },
  state: { select: { stateName: true, isoCode: true } },
  district: { select: { districtName: true, nameHi: true } },
} satisfies Prisma.OrganizationSelect;

type PublicJnvOrganization = Prisma.OrganizationGetPayload<{
  select: typeof publicJnvSelect;
}>;

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

  async findPublicJnvs(
    query: GetPublicJnvsQueryDto,
  ): Promise<PaginatedResponseDto<PublicJnvResponseDto>> {
    const stateCode = query.state_code?.trim().toUpperCase();
    const where: Prisma.OrganizationWhereInput = {
      organizationTypeId: JNV_ORGANIZATION_TYPE_ID,
      isDeleted: false,
      isFunctional: true,
      ...(query.district_id ? { districtId: query.district_id } : {}),
      ...(stateCode
        ? {
            state: {
              isoCode: {
                equals: `IN-${stateCode}`,
                mode: 'insensitive',
              },
            },
          }
        : {}),
    };
    const [organizations, totalItems] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        select: publicJnvSelect,
        orderBy: [{ organizationName: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      items: organizations.map((organization) =>
        this.toPublicJnvResponse(organization),
      ),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async update(
    id: number,
    dto: UpdateOrganizationDto,
    actor: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    const existingOrganization = await this.findActiveOrganization(id);
    const mergedDto = this.mergeWithExistingOrganization(
      dto,
      existingOrganization,
    );
    await this.ensureValuesAreUnique(
      mergedDto.organizationName,
      mergedDto.organizationCode,
      id,
    );
    const normalized = await this.validateHierarchy(mergedDto, id);
    await this.ensureTypeChangeDoesNotInvalidateChildren(
      existingOrganization,
      mergedDto.organizationTypeId,
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
    const { organizationTypeId, parentOrganizationId, regionId, stateId } = dto;
    const organizationType =
      await this.ensureActiveOrganizationType(organizationTypeId);
    if (parentOrganizationId === organizationId)
      throw new BadRequestException(
        'An organization cannot be its own parent.',
      );
    if (
      organizationType.code === organizationTypeCodes.headquarters ||
      organizationType.code === organizationTypeCodes.nli
    ) {
      if (parentOrganizationId || regionId || stateId)
        throw new BadRequestException(
          `${organizationType.code} organizations cannot have a parent, region, or state.`,
        );
      if (organizationType.code === organizationTypeCodes.headquarters) {
        const headquarters = await this.prisma.organization.findFirst({
          where: {
            organizationTypeId,
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
      return this.withSupplementalFields(
        {
          organizationName: dto.organizationName,
          organizationHindiName: dto.organizationHindiName ?? null,
          organizationCode: dto.organizationCode,
          organizationTypeId,
          address: dto.address ?? null,
          isFunctional: dto.isFunctional ?? true,
          parentOrganizationId: null,
          regionId: null,
          stateId: null,
        },
        dto,
        null,
        organizationType.code,
      );
    }
    if (!parentOrganizationId)
      throw new BadRequestException(
        `${organizationType.code} organizations must reference a parent organization.`,
      );
    const parent = await this.prisma.organization.findFirst({
      where: { id: parentOrganizationId, isDeleted: false },
      include: { organizationType: { select: { code: true } } },
    });
    if (!parent)
      throw new NotFoundException(
        'Parent organization not found or has been deleted.',
      );
    if (organizationType.code === organizationTypeCodes.regionalOffice) {
      if (parent.organizationType.code !== organizationTypeCodes.headquarters)
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
      return this.withSupplementalFields(
        {
          organizationName: dto.organizationName,
          organizationHindiName: dto.organizationHindiName ?? null,
          organizationCode: dto.organizationCode,
          organizationTypeId,
          address: dto.address ?? null,
          isFunctional: dto.isFunctional ?? true,
          parentOrganizationId,
          regionId,
          stateId: null,
        },
        dto,
        null,
        organizationType.code,
      );
    }
    if (parent.organizationType.code !== organizationTypeCodes.regionalOffice)
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
    return this.withSupplementalFields(
      {
        organizationName: dto.organizationName,
        organizationHindiName: dto.organizationHindiName ?? null,
        organizationCode: dto.organizationCode,
        organizationTypeId,
        address: dto.address ?? null,
        isFunctional: dto.isFunctional ?? true,
        parentOrganizationId,
        regionId: parent.regionId,
        stateId,
      },
      dto,
      stateId,
      organizationType.code,
    );
  }

  private async withSupplementalFields(
    data: Prisma.OrganizationUncheckedCreateInput,
    dto: CreateOrganizationDto,
    stateId: number | null,
    organizationTypeCode: string,
  ): Promise<Prisma.OrganizationUncheckedCreateInput> {
    const districtId = dto.districtId ?? null;
    const studentsCount = dto.studentsCount ?? null;

    if (districtId !== null)
      await this.ensureActiveDistrict(districtId, stateId);
    if (
      studentsCount !== null &&
      organizationTypeCode !== organizationTypeCodes.jnv
    )
      throw new BadRequestException(
        'studentsCount is only applicable to JNV organizations.',
      );

    return {
      ...data,
      districtId,
      estdYear: dto.estdYear ?? null,
      studentsCount,
    };
  }

  private mergeWithExistingOrganization(
    dto: UpdateOrganizationDto,
    existing: OrganizationWithRelations,
  ): CreateOrganizationDto {
    return {
      organizationName: dto.organizationName ?? existing.organizationName,
      organizationHindiName:
        dto.organizationHindiName === undefined
          ? (existing.organizationHindiName ?? undefined)
          : (dto.organizationHindiName ?? undefined),
      organizationCode: dto.organizationCode ?? existing.organizationCode,
      organizationTypeId: dto.organizationTypeId ?? existing.organizationTypeId,
      parentOrganizationId:
        dto.parentOrganizationId === undefined
          ? (existing.parentOrganizationId ?? undefined)
          : (dto.parentOrganizationId ?? undefined),
      regionId:
        dto.regionId === undefined
          ? (existing.regionId ?? undefined)
          : (dto.regionId ?? undefined),
      stateId:
        dto.stateId === undefined
          ? (existing.stateId ?? undefined)
          : (dto.stateId ?? undefined),
      districtId:
        dto.districtId === undefined ? existing.districtId : dto.districtId,
      estdYear: dto.estdYear === undefined ? existing.estdYear : dto.estdYear,
      studentsCount:
        dto.studentsCount === undefined
          ? existing.studentsCount
          : dto.studentsCount,
      address:
        dto.address === undefined
          ? (existing.address ?? undefined)
          : (dto.address ?? undefined),
      isFunctional: dto.isFunctional ?? existing.isFunctional,
    };
  }

  private async validateRestoration(
    organization: OrganizationWithRelations,
  ): Promise<void> {
    if (
      organization.organizationType.code === organizationTypeCodes.headquarters
    ) {
      const headquarters = await this.prisma.organization.findFirst({
        where: {
          organizationTypeId: organization.organizationTypeId,
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
    if (organization.organizationType.code === organizationTypeCodes.nli)
      return;
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
      include: { organizationType: { select: { code: true } } },
    });
    if (!parent)
      throw new ConflictException(
        'Organization cannot be restored because its parent organization has been deleted.',
      );
    if (
      organization.organizationType.code ===
      organizationTypeCodes.regionalOffice
    ) {
      if (
        parent.organizationType.code !== organizationTypeCodes.headquarters ||
        !organization.regionId
      )
        throw new ConflictException(
          'Organization cannot be restored because its hierarchy is invalid.',
        );
      await this.ensureActiveRegion(organization.regionId);
      return;
    }
    if (
      parent.organizationType.code !== organizationTypeCodes.regionalOffice ||
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
    nextTypeId: number,
  ): Promise<void> {
    if (existing.organizationTypeId === nextTypeId) return;
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

  private async ensureActiveDistrict(
    id: number,
    stateId: number | null,
  ): Promise<void> {
    const district = await this.prisma.district.findFirst({
      where: { id, isActive: true },
      select: { id: true, stateId: true },
    });
    if (!district)
      throw new NotFoundException('District not found or is inactive.');
    if (stateId !== null && district.stateId !== stateId)
      throw new BadRequestException(
        'District must belong to the selected state.',
      );
  }

  private async ensureActiveOrganizationType(id: number) {
    const organizationType = await this.prisma.organizationType.findFirst({
      where: { id, isActive: true },
      select: { id: true, code: true },
    });
    if (!organizationType)
      throw new NotFoundException(
        'Organization type not found or is inactive.',
      );
    return organizationType;
  }

  private async findActiveOrganization(
    id: number,
  ): Promise<OrganizationWithRelations> {
    const organization = await this.prisma.organization.findFirst({
      where: { id, isDeleted: false },
      include: organizationInclude,
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
      ...(query.organizationTypeId
        ? { organizationTypeId: query.organizationTypeId }
        : {}),
      ...(query.regionId ? { regionId: query.regionId } : {}),
      ...(query.stateId ? { stateId: query.stateId } : {}),
      ...(query.districtId ? { districtId: query.districtId } : {}),
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
      organizationHindiName: organization.organizationHindiName,
      organizationCode: organization.organizationCode,
      organizationTypeId: organization.organizationTypeId,
      organizationType: organization.organizationType,
      parentOrganizationId: organization.parentOrganizationId,
      regionId: organization.regionId,
      stateId: organization.stateId,
      districtId: organization.districtId,
      estdYear: organization.estdYear,
      studentsCount: organization.studentsCount,
      address: organization.address,
      isFunctional: organization.isFunctional,
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
      district: organization.district
        ? {
            id: organization.district.id,
            name: organization.district.districtName,
          }
        : null,
      isDeleted: organization.isDeleted,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }

  private toPublicJnvResponse(
    organization: PublicJnvOrganization,
  ): PublicJnvResponseDto {
    const stateCode = organization.state
      ? this.publicStateCode(organization.state.isoCode)
      : null;

    return {
      id: organization.id,
      name: organization.organizationName.split(',', 1)[0].trim(),
      stateCode,
      address: organization.address,
      state: organization.state?.stateName ?? null,
      district: organization.district?.districtName ?? null,
      schoolUrl: stateCode
        ? `/nvs-school/${stateCode.toLowerCase()}/${this.publicSchoolCode(organization.organizationCode)}`
        : null,
      estd: organization.estdYear,
      students: organization.studentsCount,
      districtHi: organization.district?.nameHi ?? null,
      nameHi: organization.organizationHindiName?.split(',', 1)[0].trim() ?? null,
      dc_ro_name: organization.region?.regionCode ?? null,
      ro_name: organization.region?.regionName ?? null,
    };
  }

  private publicStateCode(isoCode: string): string {
    return isoCode.split('-').at(-1)?.toUpperCase() ?? isoCode.toUpperCase();
  }

  private publicSchoolCode(organizationCode: string): string {
    return organizationCode.replace(/^JNV-/i, '').trim().toLowerCase();
  }

  private toAuditValues(organization: Organization): Prisma.InputJsonValue {
    return {
      id: organization.id,
      organizationName: organization.organizationName,
      organizationHindiName: organization.organizationHindiName,
      organizationCode: organization.organizationCode,
      organizationTypeId: organization.organizationTypeId,
      parentOrganizationId: organization.parentOrganizationId,
      regionId: organization.regionId,
      stateId: organization.stateId,
      districtId: organization.districtId,
      estdYear: organization.estdYear,
      studentsCount: organization.studentsCount,
      address: organization.address,
      isFunctional: organization.isFunctional,
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
