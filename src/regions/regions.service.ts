import { getAuditRequestContext } from '../common/request-context/audit-request-context';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Region } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { parseUuidList } from '../common/utils/resolve-related-id.util';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { GetRegionsQueryDto } from './dto/get-regions-query.dto';
import { RegionResponseDto } from './dto/region-response.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { PublicRegionResponseDto } from './dto/public-region-response.dto';

@Injectable()
export class RegionsService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveUuid(uuid: string): Promise<number> {
    // Resolve deleted records too; existing operations enforce visibility and state.
    const record = await this.prisma.region.findUnique({
      where: { uuid },
      select: { id: true },
    });
    if (!record) throw new NotFoundException('Record not found.');
    return record.id;
  }

  async create(
    dto: CreateRegionDto,
    actor: AuthenticatedUser,
  ): Promise<RegionResponseDto> {
    await this.ensureValuesAreUnique(dto.regionName, dto.regionCode);
    const stateIds = await this.resolveStateIds(dto.state_ids, dto.state_uuids);

    const region = await this.prisma.$transaction(async (transaction) => {
      const createdRegion = await transaction.region.create({
        data: {
          regionName: dto.regionName,
          regionNameHi: dto.regionNameHi,
          regionCode: dto.regionCode,
          dcRoName: dto.dcRoName,
          dcRoNameHi: dto.dcRoNameHi,
          stateIds,
          address: dto.address,
          addressHindi: dto.addressHindi,
          phone: dto.phone,
          email: dto.email,
          createdById: actor.id,
          updatedById: actor.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          ...getAuditRequestContext(),
          userId: actor.id,
          module: 'REGION',
          entity: 'REGION',
          entityId: createdRegion.id,
          action: 'CREATE',
          newValues: this.toAuditValues(createdRegion),
        },
      });

      return createdRegion;
    });

    return this.toResponse(region);
  }

  async findAll(
    query: GetRegionsQueryDto,
  ): Promise<PaginatedResponseDto<RegionResponseDto>> {
    const { page, limit, search, sort, order, isDeleted } = query;
    const where = this.buildWhere(search, isDeleted);
    const orderBy: Prisma.RegionOrderByWithRelationInput = { [sort]: order };

    const [regions, totalItems] = await this.prisma.$transaction([
      this.prisma.region.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.region.count({ where }),
    ]);

    return {
      items: regions.map((region) => this.toResponse(region)),
      meta: PaginationUtil.buildMeta(page, limit, totalItems),
    };
  }

  async findOne(id: number): Promise<RegionResponseDto> {
    const region = await this.prisma.region.findFirst({
      where: { id, isDeleted: false },
    });

    if (!region) {
      throw new NotFoundException('Region not found.');
    }

    return this.toResponse(region);
  }

  async findPublic(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PublicRegionResponseDto>> {
    const search = query.search?.trim();
    const where: Prisma.RegionWhereInput = {
      isDeleted: false,
      ...(search
        ? {
            OR: [
              { regionName: { contains: search, mode: 'insensitive' } },
              { regionNameHi: { contains: search, mode: 'insensitive' } },
              { regionCode: { contains: search, mode: 'insensitive' } },
              { dcRoName: { contains: search, mode: 'insensitive' } },
              { dcRoNameHi: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
              { addressHindi: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [regions, totalItems] = await this.prisma.$transaction([
      this.prisma.region.findMany({
        where,
        orderBy: [{ regionName: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.region.count({ where }),
    ]);

    return {
      items: regions.map((region) => this.toPublicResponse(region)),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async findPublicOne(
    identifier: { id: number } | { uuid: string },
  ): Promise<PublicRegionResponseDto> {
    const region = await this.prisma.region.findFirst({
      where: { ...identifier, isDeleted: false },
    });
    if (!region) throw new NotFoundException('Region not found.');

    return this.toPublicResponse(region);
  }

  async update(
    id: number,
    dto: UpdateRegionDto,
    actor: AuthenticatedUser,
  ): Promise<RegionResponseDto> {
    const existingRegion = await this.findActiveRegion(id);
    await this.ensureValuesAreUnique(dto.regionName, dto.regionCode, id);
    const stateIds =
      dto.state_ids !== undefined || dto.state_uuids !== undefined
        ? await this.resolveStateIds(dto.state_ids, dto.state_uuids)
        : undefined;

    const region = await this.prisma.$transaction(async (transaction) => {
      const updatedRegion = await transaction.region.update({
        where: { id },
        data: {
          regionName: dto.regionName,
          regionNameHi: dto.regionNameHi,
          regionCode: dto.regionCode,
          dcRoName: dto.dcRoName,
          dcRoNameHi: dto.dcRoNameHi,
          ...(stateIds !== undefined ? { stateIds } : {}),
          address: dto.address,
          addressHindi: dto.addressHindi,
          phone: dto.phone,
          email: dto.email,
          updatedById: actor.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          ...getAuditRequestContext(),
          userId: actor.id,
          module: 'REGION',
          entity: 'REGION',
          entityId: id,
          action: 'UPDATE',
          previousValues: this.toAuditValues(existingRegion),
          newValues: this.toAuditValues(updatedRegion),
        },
      });

      return updatedRegion;
    });

    return this.toResponse(region);
  }

  async remove(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<RegionResponseDto> {
    const region = await this.prisma.$transaction(async (transaction) => {
      const existingRegion = await transaction.region.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existingRegion) {
        throw new NotFoundException(
          'Region not found or has already been deleted.',
        );
      }

      const organizationCount = await transaction.organization.count({
        where: { regionId: id },
      });

      if (organizationCount > 0) {
        throw new ConflictException(
          'Region cannot be deleted because it is referenced by organizations.',
        );
      }

      const deletedRegion = await transaction.region.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById: actor.id,
          updatedById: actor.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          ...getAuditRequestContext(),
          userId: actor.id,
          module: 'REGION',
          entity: 'REGION',
          entityId: id,
          action: 'DELETE',
          previousValues: this.toAuditValues(existingRegion),
          newValues: this.toAuditValues(deletedRegion),
        },
      });

      return deletedRegion;
    });

    return this.toResponse(region);
  }

  async restore(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<RegionResponseDto> {
    const region = await this.prisma.$transaction(async (transaction) => {
      const existingRegion = await transaction.region.findFirst({
        where: { id, isDeleted: true },
      });

      if (!existingRegion) {
        throw new NotFoundException('Deleted region not found.');
      }

      const restoredRegion = await transaction.region.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null,
          deletedById: null,
          updatedById: actor.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          ...getAuditRequestContext(),
          userId: actor.id,
          module: 'REGION',
          entity: 'REGION',
          entityId: id,
          action: 'RESTORE',
          previousValues: this.toAuditValues(existingRegion),
          newValues: this.toAuditValues(restoredRegion),
        },
      });

      return restoredRegion;
    });

    return this.toResponse(region);
  }

  private async findActiveRegion(id: number): Promise<Region> {
    const region = await this.prisma.region.findFirst({
      where: { id, isDeleted: false },
    });

    if (!region) {
      throw new NotFoundException('Region not found or has been deleted.');
    }

    return region;
  }

  private async ensureValuesAreUnique(
    regionName: string,
    regionCode: string,
    excludedId?: number,
  ): Promise<void> {
    const duplicate = await this.prisma.region.findFirst({
      where: {
        ...(excludedId ? { id: { not: excludedId } } : {}),
        OR: [{ regionName }, { regionCode }],
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException(
        'A region with the same name or code already exists.',
      );
    }
  }

  private buildWhere(
    search?: string,
    isDeleted?: boolean,
  ): Prisma.RegionWhereInput {
    const where: Prisma.RegionWhereInput = {
      isDeleted: isDeleted ?? false,
    };

    if (search?.trim()) {
      where.OR = [
        { regionName: { contains: search.trim(), mode: 'insensitive' } },
        { regionNameHi: { contains: search.trim(), mode: 'insensitive' } },
        { regionCode: { contains: search.trim(), mode: 'insensitive' } },
        { dcRoName: { contains: search.trim(), mode: 'insensitive' } },
        { dcRoNameHi: { contains: search.trim(), mode: 'insensitive' } },
        { address: { contains: search.trim(), mode: 'insensitive' } },
        { addressHindi: { contains: search.trim(), mode: 'insensitive' } },
        { phone: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async normalizeAndValidateStateIds(
    stateIds: string,
  ): Promise<string> {
    const entries = stateIds.split(',').map((value) => value.trim());
    if (
      entries.length === 0 ||
      entries.some((value) => !/^[1-9]\d*$/.test(value))
    ) {
      throw new BadRequestException(
        'state_ids must be a comma-separated list of valid State IDs.',
      );
    }

    const ids = [...new Set(entries.map(Number))];
    const stateCount = await this.prisma.state.count({
      where: { id: { in: ids }, isDeleted: false },
    });
    if (stateCount !== ids.length) {
      throw new NotFoundException('One or more State IDs were not found.');
    }

    return ids.join(',');
  }

  private async resolveStateIds(ids?: string, uuids?: string): Promise<string> {
    if (!uuids) return this.normalizeAndValidateStateIds(ids!);
    const values = parseUuidList(uuids, 'state_uuids');
    const states = await this.prisma.state.findMany({
      where: { uuid: { in: values } },
      select: { id: true, uuid: true },
    });
    if (states.length !== values.length)
      throw new BadRequestException('One or more state UUIDs are invalid.');
    const byUuid = new Map(states.map((state) => [state.uuid, state.id]));
    const resolved = values.map((uuid) => byUuid.get(uuid)!).join(',');
    if (ids) await this.normalizeAndValidateStateIds(ids);
    return this.normalizeAndValidateStateIds(resolved);
  }

  private toResponse(region: Region): RegionResponseDto {
    return {
      id: region.id,
      uuid: region.uuid,
      regionName: region.regionName,
      regionNameHi: region.regionNameHi,
      regionCode: region.regionCode,
      dcRoName: region.dcRoName,
      dcRoNameHi: region.dcRoNameHi,
      state_ids: region.stateIds,
      address: region.address,
      addressHindi: region.addressHindi,
      phone: region.phone,
      email: region.email,
      createdAt: region.createdAt,
      updatedAt: region.updatedAt,
    };
  }

  private toPublicResponse(region: Region): PublicRegionResponseDto {
    return {
      id: region.id,
      uuid: region.uuid,
      regionName: region.regionName,
      regionNameHi: region.regionNameHi,
      regionCode: region.regionCode,
      dcRoName: region.dcRoName,
      dcRoNameHi: region.dcRoNameHi,
      address: region.address,
      addressHindi: region.addressHindi,
      phone: region.phone,
      email: region.email,
    };
  }

  private toAuditValues(region: Region): Prisma.InputJsonValue {
    return {
      id: region.id,
      regionName: region.regionName,
      regionNameHi: region.regionNameHi,
      regionCode: region.regionCode,
      dcRoName: region.dcRoName,
      dcRoNameHi: region.dcRoNameHi,
      state_ids: region.stateIds,
      address: region.address,
      addressHindi: region.addressHindi,
      phone: region.phone,
      email: region.email,
      createdAt: region.createdAt.toISOString(),
      updatedAt: region.updatedAt.toISOString(),
      createdById: region.createdById,
      updatedById: region.updatedById,
      isDeleted: region.isDeleted,
      deletedAt: region.deletedAt?.toISOString() ?? null,
      deletedById: region.deletedById,
    };
  }
}
