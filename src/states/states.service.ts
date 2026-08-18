import { Injectable } from '@nestjs/common';
import { Prisma, State } from '@prisma/client';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { GetStatesQueryDto } from './dto/get-states-query.dto';
import { StateResponseDto } from './dto/state-response.dto';

@Injectable()
export class StatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: GetStatesQueryDto,
  ): Promise<PaginatedResponseDto<StateResponseDto>> {
    const { page, limit, search, ro_id, sort, order } = query;
    const where: Prisma.StateWhereInput = {
      isActive: true,
      isDeleted: false,
      ...(ro_id !== undefined ? { roId: ro_id } : {}),
      ...(search?.trim()
        ? {
            OR: [
              {
                stateName: { contains: search.trim(), mode: 'insensitive' },
              },
              {
                stateCode: { contains: search.trim(), mode: 'insensitive' },
              },
              { isoCode: { contains: search.trim(), mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const orderBy: Prisma.StateOrderByWithRelationInput = { [sort]: order };

    const [states, totalItems] = await this.prisma.$transaction([
      this.prisma.state.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.state.count({ where }),
    ]);

    return {
      items: states.map((state) => this.toResponse(state)),
      meta: PaginationUtil.buildMeta(page, limit, totalItems),
    };
  }

  private toResponse(state: State): StateResponseDto {
    return {
      id: state.id,
      stateName: state.stateName,
      nameHi: state.nameHi,
      stateCode: state.stateCode,
      isActive: state.isActive,
      roId: state.roId,
      isoCode: state.isoCode,
    };
  }
}
