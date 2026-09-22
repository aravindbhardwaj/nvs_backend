import { getAuditRequestContext } from '../common/request-context/audit-request-context';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Organization, Prisma, Role } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { resolveRelatedId } from '../common/utils/resolve-related-id.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { GetOrganizationsQueryDto } from './dto/get-organizations-query.dto';
import { GetPublicJnvsQueryDto } from './dto/get-public-jnvs-query.dto';
import { GetPublicOrganizationsQueryDto } from './dto/get-public-organizations-query.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { PublicJnvResponseDto } from './dto/public-jnv-response.dto';
import { PublicNliResponseDto } from './dto/public-nli-response.dto';
import { PublicOrganizationResponseDto } from './dto/public-organization-response.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { cleanupOrganizationProfileImageUrl } from './organization-profile-image.storage';

const organizationInclude = {
  organizationType: {
    select: { id: true, uuid: true, code: true, name: true },
  },
  parentOrganization: {
    select: {
      id: true,
      uuid: true,
      organizationName: true,
      organizationType: { select: { code: true } },
    },
  },
  region: { select: { id: true, uuid: true, regionName: true } },
  state: { select: { id: true, uuid: true, stateName: true } },
  district: { select: { id: true, uuid: true, districtName: true } },
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
  uuid: true,
  organizationName: true,
  organizationHindiName: true,
  organizationNameEn: true,
  organizationNameHi: true,
  organizationCode: true,
  schoolUrl: true,
  shortDescription: true,
  shortDescriptionHi: true,
  imageUrl: true,
  address: true,
  addressHindi: true,
  estdYear: true,
  studentsCount: true,
  region: {
    select: {
      dcRoName: true,
      dcRoNameHi: true,
      regionName: true,
      regionNameHi: true,
    },
  },
  state: { select: { stateName: true, nameHi: true, isoCode: true } },
  district: { select: { districtName: true, nameHi: true } },
  jnvPrincipals: {
    where: { isActive: true, isDeleted: false, relievedAt: null },
    select: {
      principalNameEnglish: true,
      principalNameHindi: true,
      email: true,
      mobile: true,
    },
    orderBy: [{ joinedAt: 'desc' as const }, { id: 'desc' as const }],
    take: 1,
  },
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

  async resolveUuid(uuid: string): Promise<number> {
    // Resolve deleted records too; existing operations enforce visibility and state.
    const record = await this.prisma.organization.findUnique({
      where: { uuid },
      select: { id: true },
    });
    if (!record) throw new NotFoundException('Record not found.');
    return record.id;
  }

  async create(
    dto: CreateOrganizationDto,
    actor: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    await this.ensureValuesAreUnique(
      dto.organizationName,
      dto.organizationCode,
    );
    const resolvedDto = await this.resolveCreateRelations(dto);
    const normalized = await this.validateHierarchy(resolvedDto);

    const organization = await this.prisma.$transaction(async (transaction) => {
      const createdOrganization = await transaction.organization.create({
        data: { ...normalized, createdById: actor.id, updatedById: actor.id },
        include: organizationInclude,
      });
      await transaction.auditLog.create({
        data: {
          ...getAuditRequestContext(),
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
    await this.resolveQueryRelations(query);
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

  async findMaster(query: GetOrganizationsQueryDto): Promise<
    PaginatedResponseDto<{
      id: number;
      uuid: string;
      name: string;
      organizationTypeId: number;
      organization_name_en: string | null;
      organization_name_hi: string | null;
      short_description: string | null;
      short_description_hi: string | null;
      image_url: string | null;
    }>
  > {
    await this.resolveQueryRelations(query);
    const { page, limit, sort, order } = query;
    const where = this.buildWhere(query);
    const [organizations, totalItems] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        select: {
          id: true,
          uuid: true,
          organizationName: true,
          organizationTypeId: true,
          organizationNameEn: true,
          organizationNameHi: true,
          shortDescription: true,
          shortDescriptionHi: true,
          imageUrl: true,
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      items: organizations.map((organization) => ({
        id: organization.id,
        uuid: organization.uuid,
        name: organization.organizationName,
        organizationTypeId: organization.organizationTypeId,
        organization_name_en: organization.organizationNameEn,
        organization_name_hi: organization.organizationNameHi,
        short_description: organization.shortDescription,
        short_description_hi: organization.shortDescriptionHi,
        image_url: organization.imageUrl,
      })),
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

  async findOneByUuid(
    uuid: string,
    actor: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.prisma.organization.findFirst({
      where: { uuid, isDeleted: false },
      include: organizationInclude,
    });
    if (!organization) throw new NotFoundException('Organization not found.');
    this.assertProfileAccess(organization.id, actor);
    return this.toResponse(organization);
  }

  async updateProfileByUuid(
    uuid: string,
    dto: {
      short_description?: string | null;
      short_description_hi?: string | null;
      image_url?: string;
    },
    actor: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    if (
      dto.short_description === undefined &&
      dto.short_description_hi === undefined &&
      dto.image_url === undefined
    ) {
      throw new BadRequestException(
        'At least one of short_description, short_description_hi, or image_url is required.',
      );
    }

    let previousImageUrl: string | null = null;
    const organization = await this.prisma.$transaction(async (transaction) => {
      const existingOrganization = await transaction.organization.findFirst({
        where: { uuid, isDeleted: false },
        include: organizationInclude,
      });
      if (!existingOrganization)
        throw new NotFoundException(
          'Organization not found or has been deleted.',
        );
      this.assertProfileAccess(existingOrganization.id, actor);
      previousImageUrl = existingOrganization.imageUrl;

      const updatedOrganization = await transaction.organization.update({
        where: { uuid },
        data: {
          ...(dto.short_description !== undefined
            ? { shortDescription: dto.short_description }
            : {}),
          ...(dto.short_description_hi !== undefined
            ? { shortDescriptionHi: dto.short_description_hi }
            : {}),
          ...(dto.image_url !== undefined ? { imageUrl: dto.image_url } : {}),
          updatedById: actor.id,
        },
        include: organizationInclude,
      });
      await transaction.auditLog.create({
        data: {
          ...getAuditRequestContext(),
          userId: actor.id,
          module: 'ORGANIZATION',
          entity: 'ORGANIZATION',
          entityId: updatedOrganization.id,
          action: 'UPDATE',
          previousValues: this.toAuditValues(existingOrganization),
          newValues: this.toAuditValues(updatedOrganization),
        },
      });
      return updatedOrganization;
    });

    if (dto.image_url && previousImageUrl !== dto.image_url)
      await cleanupOrganizationProfileImageUrl(previousImageUrl);

    return this.toResponse(organization);
  }

  private assertProfileAccess(
    organizationId: number,
    actor: AuthenticatedUser,
  ): void {
    if (
      actor.role !== Role.SUPER_ADMIN &&
      actor.organizationId !== organizationId
    ) {
      throw new ForbiddenException(
        'You can only view or update your own organization profile.',
      );
    }
  }

  async findPublicJnvs(
    query: GetPublicJnvsQueryDto,
  ): Promise<PaginatedResponseDto<PublicJnvResponseDto>> {
    query.district_id = await this.resolveModelId(
      query.district_id,
      query.district_uuid,
      'District',
      this.prisma.district,
    );
    query.regional_office_id = await this.resolveModelId(
      query.regional_office_id,
      query.regional_office_uuid,
      'Regional Office',
      this.prisma.organization,
    );
    const stateCode = query.state_code?.trim().toUpperCase();
    const where: Prisma.OrganizationWhereInput = {
      organizationTypeId: JNV_ORGANIZATION_TYPE_ID,
      isDeleted: false,
      isFunctional: true,
      ...(query.district_id ? { districtId: query.district_id } : {}),
      ...(query.regional_office_id
        ? { parentOrganizationId: query.regional_office_id }
        : {}),
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

  async findPublicRegionalOffices(
    query: GetPublicOrganizationsQueryDto,
  ): Promise<PaginatedResponseDto<PublicOrganizationResponseDto>> {
    return this.findPublicOrganizations(
      organizationTypeCodes.regionalOffice,
      query,
    );
  }

  async findPublicNlis(
    query: GetPublicOrganizationsQueryDto,
  ): Promise<PaginatedResponseDto<PublicNliResponseDto>> {
    const where: Prisma.OrganizationWhereInput = {
      organizationType: {
        code: organizationTypeCodes.nli,
        isActive: true,
      },
      isDeleted: false,
      isFunctional: true,
    };
    const [organizations, totalItems] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        select: {
          uuid: true,
          organizationCode: true,
          organizationName: true,
          organizationHindiName: true,
          organizationNameEn: true,
          organizationNameHi: true,
          directorNameEn: true,
          directorNameHi: true,
          address: true,
          addressHindi: true,
          phoneNumber: true,
          emailAddress: true,
          shortDescription: true,
          shortDescriptionHi: true,
          imageUrl: true,
        },
        orderBy: [{ organizationName: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      items: organizations.map((organization) => ({
        uuid: organization.uuid,
        url: `/nli/${organization.organizationCode.toLowerCase()}`,
        name_en:
          organization.organizationNameEn ?? organization.organizationName,
        name_hi:
          organization.organizationNameHi ?? organization.organizationHindiName,
        director_name_en: organization.directorNameEn,
        director_name_hi: organization.directorNameHi,
        address_en: organization.address,
        address_hi: organization.addressHindi,
        phone_number: organization.phoneNumber,
        email_address: organization.emailAddress,
        short_description: organization.shortDescription,
        short_description_hi: organization.shortDescriptionHi,
        image_url: organization.imageUrl,
      })),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  private async findPublicOrganizations(
    typeCode: 'REGIONAL_OFFICE' | 'NLI',
    query: GetPublicOrganizationsQueryDto,
  ): Promise<PaginatedResponseDto<PublicOrganizationResponseDto>> {
    const where: Prisma.OrganizationWhereInput = {
      organizationType: { code: typeCode, isActive: true },
      isDeleted: false,
      isFunctional: true,
    };
    const [organizations, totalItems] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        select: {
          id: true,
          uuid: true,
          organizationName: true,
          organizationHindiName: true,
          organizationNameHi: true,
          organizationCode: true,
          address: true,
          addressHindi: true,
          shortDescription: true,
          shortDescriptionHi: true,
          imageUrl: true,
          region: {
            select: {
              regionName: true,
              regionNameHi: true,
              stateIds: true,
              dcRoName: true,
              dcRoNameHi: true,
              address: true,
              addressHindi: true,
              phone: true,
              email: true,
            },
          },
        },
        orderBy: [{ organizationName: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    const stateIds = [
      ...new Set(
        organizations.flatMap((organization) =>
          this.parseStoredIds(organization.region?.stateIds),
        ),
      ),
    ];
    const states = stateIds.length
      ? await this.prisma.state.findMany({
          where: {
            id: { in: stateIds },
            isActive: true,
            isDeleted: false,
          },
          select: { id: true, stateName: true, nameHi: true },
        })
      : [];
    const statesById = new Map(states.map((state) => [state.id, state]));

    return {
      items: organizations.map((organization) => {
        const regionStateIds = this.parseStoredIds(
          organization.region?.stateIds,
        );
        const stateNames = regionStateIds.flatMap((stateId) => {
          const name = statesById.get(stateId)?.stateName;
          return name ? [name] : [];
        });
        const stateNamesHi = regionStateIds.flatMap((stateId) => {
          const name = statesById.get(stateId)?.nameHi;
          return name ? [name] : [];
        });
        return {
          id: organization.id,
          uuid: organization.uuid,
          url: `/ro/${organization.organizationCode.toLowerCase()}`,
          name: organization.organizationName,
          nameHi:
            organization.organizationNameHi ??
            organization.organizationHindiName,
          code: organization.organizationCode,
          address: organization.address,
          address_hindi: organization.addressHindi,
          region: organization.region?.regionName ?? null,
          regionHi: organization.region?.regionNameHi ?? null,
          dcRoName: organization.region?.dcRoName ?? null,
          dcRoNameHi: organization.region?.dcRoNameHi ?? null,
          regionAddress: organization.region?.address ?? null,
          regionAddressHindi: organization.region?.addressHindi ?? null,
          regionPhone: organization.region?.phone ?? null,
          regionEmail: organization.region?.email ?? null,
          stateNames: stateNames.length ? stateNames.join(', ') : null,
          stateNamesHi: stateNamesHi.length ? stateNamesHi.join(', ') : null,
          short_description: organization.shortDescription,
          short_description_hi: organization.shortDescriptionHi,
          image_url: organization.imageUrl,
        };
      }),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  private parseStoredIds(value: string | null | undefined): number[] {
    if (!value) return [];
    return value
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0);
  }

  async findPublicJnvStateMap(): Promise<
    Record<string, [string, number, string]>
  > {
    const organizations = await this.prisma.organization.findMany({
      where: {
        organizationTypeId: JNV_ORGANIZATION_TYPE_ID,
        isDeleted: false,
        isFunctional: true,
        state: { isActive: true, isDeleted: false },
        region: { isDeleted: false },
      },
      select: {
        state: { select: { isoCode: true } },
        region: { select: { regionName: true } },
      },
      orderBy: [{ state: { isoCode: 'asc' } }, { id: 'asc' }],
    });

    return organizations.reduce<Record<string, [string, number, string]>>(
      (stateMap, organization) => {
        if (!organization.state || !organization.region) return stateMap;
        const stateCode = organization.state.isoCode
          .replace(/^IN-/i, '')
          .toUpperCase();
        const stateKey = stateCode.toLowerCase();
        const regionName = organization.region.regionName.replace(
          /\s+Region$/i,
          '',
        );
        const current = stateMap[stateKey];
        stateMap[stateKey] = current
          ? [current[0], current[1] + 1, current[2]]
          : [regionName, 1, stateCode];
        return stateMap;
      },
      {},
    );
  }

  async update(
    id: number,
    dto: UpdateOrganizationDto,
    actor: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    const existingOrganization = await this.findActiveOrganization(id);
    dto.organizationTypeId = await this.resolveModelId(
      dto.organizationTypeId,
      dto.organizationTypeUuid,
      'Organization type',
      this.prisma.organizationType,
    );
    dto.parentOrganizationId = await this.resolveModelId(
      dto.parentOrganizationId,
      dto.parentOrganizationUuid,
      'Parent organization',
      this.prisma.organization,
    );
    dto.regionId = await this.resolveModelId(
      dto.regionId,
      dto.regionUuid,
      'Region',
      this.prisma.region,
    );
    dto.stateId = await this.resolveModelId(
      dto.stateId,
      dto.stateUuid,
      'State',
      this.prisma.state,
    );
    dto.districtId = await this.resolveModelId(
      dto.districtId,
      dto.districtUuid,
      'District',
      this.prisma.district,
    );
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
      mergedDto.organizationTypeId!,
    );

    const organization = await this.prisma.$transaction(async (transaction) => {
      const updatedOrganization = await transaction.organization.update({
        where: { id },
        data: { ...normalized, updatedById: actor.id },
        include: organizationInclude,
      });
      await transaction.auditLog.create({
        data: {
          ...getAuditRequestContext(),
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
          ...getAuditRequestContext(),
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
          ...getAuditRequestContext(),
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
    const { parentOrganizationId, regionId, stateId } = dto;
    const organizationTypeId = dto.organizationTypeId!;
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
          addressHindi: dto.addressHindi ?? null,
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
          addressHindi: dto.addressHindi ?? null,
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
        addressHindi: dto.addressHindi ?? null,
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

  private async resolveCreateRelations(
    dto: CreateOrganizationDto,
  ): Promise<CreateOrganizationDto & { organizationTypeId: number }> {
    const resolveId = (
      id: number | null | undefined,
      uuid: string | null | undefined,
      label: string,
      model: {
        findUnique(args: {
          where: { uuid: string };
          select: { id: true };
        }): Promise<{ id: number } | null>;
      },
    ) =>
      resolveRelatedId(id, uuid, label, (value) =>
        model.findUnique({ where: { uuid: value }, select: { id: true } }),
      );

    return {
      ...dto,
      organizationTypeId: (await resolveId(
        dto.organizationTypeId,
        dto.organizationTypeUuid,
        'Organization type',
        this.prisma.organizationType,
      ))!,
      parentOrganizationId: await resolveId(
        dto.parentOrganizationId,
        dto.parentOrganizationUuid,
        'Parent organization',
        this.prisma.organization,
      ),
      regionId: await resolveId(
        dto.regionId,
        dto.regionUuid,
        'Region',
        this.prisma.region,
      ),
      stateId: await resolveId(
        dto.stateId,
        dto.stateUuid,
        'State',
        this.prisma.state,
      ),
      districtId: await resolveId(
        dto.districtId,
        dto.districtUuid,
        'District',
        this.prisma.district,
      ),
    };
  }

  private resolveModelId(
    id: number | null | undefined,
    uuid: string | null | undefined,
    label: string,
    model: {
      findUnique(args: {
        where: { uuid: string };
        select: { id: true };
      }): Promise<{ id: number } | null>;
    },
  ) {
    if (uuid === null) return Promise.resolve(undefined);
    return resolveRelatedId(id, uuid, label, (value) =>
      model.findUnique({ where: { uuid: value }, select: { id: true } }),
    );
  }

  private async resolveQueryRelations(
    query: GetOrganizationsQueryDto,
  ): Promise<void> {
    query.organizationTypeId = await this.resolveModelId(
      query.organizationTypeId,
      query.organizationTypeUuid,
      'Organization type',
      this.prisma.organizationType,
    );
    query.regionId = await this.resolveModelId(
      query.regionId,
      query.regionUuid,
      'Region',
      this.prisma.region,
    );
    query.stateId = await this.resolveModelId(
      query.stateId,
      query.stateUuid,
      'State',
      this.prisma.state,
    );
    query.districtId = await this.resolveModelId(
      query.districtId,
      query.districtUuid,
      'District',
      this.prisma.district,
    );
    query.parentOrganizationId = await this.resolveModelId(
      query.parentOrganizationId,
      query.parentOrganizationUuid,
      'Parent organization',
      this.prisma.organization,
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
    const nliContactFields = [
      dto.director_name_en,
      dto.director_name_hi,
      dto.phone_number,
      dto.email_address,
    ];

    if (districtId !== null)
      await this.ensureActiveDistrict(districtId, stateId);
    if (
      studentsCount !== null &&
      organizationTypeCode !== organizationTypeCodes.jnv
    )
      throw new BadRequestException(
        'studentsCount is only applicable to JNV organizations.',
      );
    if (
      organizationTypeCode !== organizationTypeCodes.nli &&
      nliContactFields.some((value) => value != null)
    )
      throw new BadRequestException(
        'Director, phone number, and email address fields are only applicable to NLI organizations.',
      );

    return {
      ...data,
      address:
        dto.address_en !== undefined ? dto.address_en : (data.address ?? null),
      addressHindi:
        dto.address_hi !== undefined
          ? dto.address_hi
          : (data.addressHindi ?? null),
      organizationNameEn: dto.name_en ?? null,
      organizationNameHi: dto.name_hi ?? null,
      districtId,
      estdYear: dto.estdYear ?? null,
      studentsCount,
      directorNameEn:
        organizationTypeCode === organizationTypeCodes.nli
          ? (dto.director_name_en ?? null)
          : null,
      directorNameHi:
        organizationTypeCode === organizationTypeCodes.nli
          ? (dto.director_name_hi ?? null)
          : null,
      phoneNumber:
        organizationTypeCode === organizationTypeCodes.nli
          ? (dto.phone_number ?? null)
          : null,
      emailAddress:
        organizationTypeCode === organizationTypeCodes.nli
          ? (dto.email_address ?? null)
          : null,
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
      name_en:
        dto.name_en === undefined ? existing.organizationNameEn : dto.name_en,
      name_hi:
        dto.name_hi === undefined ? existing.organizationNameHi : dto.name_hi,
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
        dto.address_en !== undefined
          ? (dto.address_en ?? undefined)
          : dto.address === undefined
            ? (existing.address ?? undefined)
            : (dto.address ?? undefined),
      addressHindi:
        dto.address_hi !== undefined
          ? (dto.address_hi ?? undefined)
          : dto.addressHindi === undefined
            ? (existing.addressHindi ?? undefined)
            : (dto.addressHindi ?? undefined),
      director_name_en:
        dto.director_name_en === undefined
          ? existing.directorNameEn
          : dto.director_name_en,
      director_name_hi:
        dto.director_name_hi === undefined
          ? existing.directorNameHi
          : dto.director_name_hi,
      phone_number:
        dto.phone_number === undefined
          ? existing.phoneNumber
          : dto.phone_number,
      email_address:
        dto.email_address === undefined
          ? existing.emailAddress
          : dto.email_address,
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
      uuid: organization.uuid,
      organizationName: organization.organizationName,
      organizationHindiName: organization.organizationHindiName,
      organization_name_en: organization.organizationNameEn,
      organization_name_hi: organization.organizationNameHi,
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
      addressHindi: organization.addressHindi,
      director_name_en: organization.directorNameEn,
      director_name_hi: organization.directorNameHi,
      phone_number: organization.phoneNumber,
      email_address: organization.emailAddress,
      short_description: organization.shortDescription,
      short_description_hi: organization.shortDescriptionHi,
      image_url: organization.imageUrl,
      isFunctional: organization.isFunctional,
      parentOrganization: organization.parentOrganization
        ? {
            id: organization.parentOrganization.id,
            uuid: organization.parentOrganization.uuid,
            name: organization.parentOrganization.organizationName,
          }
        : null,
      region: organization.region
        ? {
            id: organization.region.id,
            uuid: organization.region.uuid,
            name: organization.region.regionName,
          }
        : null,
      state: organization.state
        ? {
            id: organization.state.id,
            uuid: organization.state.uuid,
            name: organization.state.stateName,
          }
        : null,
      district: organization.district
        ? {
            id: organization.district.id,
            uuid: organization.district.uuid,
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
    const principal = organization.jnvPrincipals[0];

    return {
      id: organization.id,
      uuid: organization.uuid,
      name: organization.organizationName,
      stateCode,
      organization_name_en: organization.organizationNameEn,
      organization_name_hi: organization.organizationNameHi,
      address: organization.address,
      address_hindi: organization.addressHindi,
      state: organization.state?.stateName ?? null,
      stateHi: organization.state?.nameHi ?? null,
      district: organization.district?.districtName ?? null,
      schoolUrl:
        organization.schoolUrl ??
        (stateCode
          ? `/nvs-school/${stateCode.toLowerCase()}/${this.publicSchoolCode(organization.organizationCode)}`
          : null),
      estd: organization.estdYear,
      students: organization.studentsCount,
      districtHi: organization.district?.nameHi ?? null,
      nameHi: organization.organizationHindiName,
      dc_ro_name: organization.region?.dcRoName ?? null,
      dc_ro_name_hi: organization.region?.dcRoNameHi ?? null,
      ro_name: organization.region?.regionName ?? null,
      ro_name_hi: organization.region?.regionNameHi ?? null,
      principal_name_english: principal?.principalNameEnglish ?? null,
      principal_name_hindi: principal?.principalNameHindi ?? null,
      principal_email: principal?.email ?? null,
      principal_mobile: principal?.mobile ?? null,
      short_description: organization.shortDescription,
      short_description_hi: organization.shortDescriptionHi,
      image_url: organization.imageUrl,
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
      addressHindi: organization.addressHindi,
      director_name_en: organization.directorNameEn,
      director_name_hi: organization.directorNameHi,
      phone_number: organization.phoneNumber,
      email_address: organization.emailAddress,
      short_description: organization.shortDescription,
      short_description_hi: organization.shortDescriptionHi,
      image_url: organization.imageUrl,
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
