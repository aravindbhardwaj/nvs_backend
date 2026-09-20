import { Injectable } from '@nestjs/common';
import { District, Prisma } from '@prisma/client';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { resolveRelatedId } from '../common/utils/resolve-related-id.util';
import { PrismaService } from '../prisma/prisma.service';
import { DistrictResponseDto } from './dto/district-response.dto';
import { GetDistrictsQueryDto } from './dto/get-districts-query.dto';

@Injectable()
export class DistrictsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: GetDistrictsQueryDto,
  ): Promise<PaginatedResponseDto<DistrictResponseDto>> {
    query.stateId = await resolveRelatedId(query.stateId, query.stateUuid, 'State',
      (uuid) => this.prisma.state.findUnique({ where: { uuid }, select: { id: true } }));
    query.roId = await resolveRelatedId(query.roId, query.roUuid, 'Region',
      (uuid) => this.prisma.region.findUnique({ where: { uuid }, select: { id: true } }));
    const { page, limit, search, stateId, roId, isActive, sort, order } = query;
    const where: Prisma.DistrictWhereInput = {
      isActive,
      ...(stateId !== undefined ? { stateId } : {}),
      ...(roId !== undefined ? { roId } : {}),
      ...(search?.trim()
        ? {
            OR: [
              {
                districtName: { contains: search.trim(), mode: 'insensitive' },
              },
              {
                districtCode: { contains: search.trim(), mode: 'insensitive' },
              },
            ],
          }
        : {}),
    };
    const orderBy: Prisma.DistrictOrderByWithRelationInput = { [sort]: order };

    const [districts, totalItems] = await this.prisma.$transaction([
      this.prisma.district.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.district.count({ where }),
    ]);

    return {
      items: districts.map((district) => this.toResponse(district)),
      meta: PaginationUtil.buildMeta(page, limit, totalItems),
    };
  }

  private toResponse(district: District): DistrictResponseDto {
    return {
      id: district.id,
      uuid: district.uuid,
      districtName: district.districtName,
      nameHi: district.nameHi,
      districtCode: district.districtCode,
      stateId: district.stateId,
      isActive: district.isActive,
      languageId: district.languageId,
      oldDistrictCode: district.oldDistrictCode,
      oldDistrictName: district.oldDistrictName,
      roId: district.roId,
      createdAt: district.createdAt,
      updatedAt: district.updatedAt,
    };
  }
}
