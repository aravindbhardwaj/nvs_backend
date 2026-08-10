import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, State } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStateDto } from './dto/create-state.dto';
import { GetStatesQueryDto } from './dto/get-states-query.dto';
import { StateResponseDto } from './dto/state-response.dto';
import { UpdateStateDto } from './dto/update-state.dto';

@Injectable()
export class StatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateStateDto,
    actor: AuthenticatedUser,
  ): Promise<StateResponseDto> {
    await this.ensureValuesAreUnique(dto.stateName, dto.stateCode);

    const state = await this.prisma.$transaction(async (transaction) => {
      const createdState = await transaction.state.create({
        data: {
          stateName: dto.stateName,
          stateCode: dto.stateCode,
          createdById: actor.id,
          updatedById: actor.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'STATE',
          entity: 'STATE',
          entityId: createdState.id,
          action: 'CREATE',
          newValues: this.toAuditValues(createdState),
        },
      });

      return createdState;
    });

    return this.toResponse(state);
  }

  async findAll(
    query: GetStatesQueryDto,
  ): Promise<PaginatedResponseDto<StateResponseDto>> {
    const { page, limit, search, sort, order, isDeleted } = query;
    const where = this.buildWhere(search, isDeleted);
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

  async findOne(id: number): Promise<StateResponseDto> {
    const state = await this.prisma.state.findFirst({
      where: { id, isDeleted: false },
    });

    if (!state) {
      throw new NotFoundException('State not found.');
    }

    return this.toResponse(state);
  }

  async update(
    id: number,
    dto: UpdateStateDto,
    actor: AuthenticatedUser,
  ): Promise<StateResponseDto> {
    const existingState = await this.findActiveState(id);
    await this.ensureValuesAreUnique(dto.stateName, dto.stateCode, id);

    const state = await this.prisma.$transaction(async (transaction) => {
      const updatedState = await transaction.state.update({
        where: { id },
        data: {
          stateName: dto.stateName,
          stateCode: dto.stateCode,
          updatedById: actor.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'STATE',
          entity: 'STATE',
          entityId: id,
          action: 'UPDATE',
          previousValues: this.toAuditValues(existingState),
          newValues: this.toAuditValues(updatedState),
        },
      });

      return updatedState;
    });

    return this.toResponse(state);
  }

  async remove(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<StateResponseDto> {
    const state = await this.prisma.$transaction(async (transaction) => {
      const existingState = await transaction.state.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existingState) {
        throw new NotFoundException(
          'State not found or has already been deleted.',
        );
      }

      const organizationCount = await transaction.organization.count({
        where: { stateId: id },
      });

      if (organizationCount > 0) {
        throw new ConflictException(
          'State cannot be deleted because it is referenced by organizations.',
        );
      }

      const deletedState = await transaction.state.update({
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
          userId: actor.id,
          module: 'STATE',
          entity: 'STATE',
          entityId: id,
          action: 'DELETE',
          previousValues: this.toAuditValues(existingState),
          newValues: this.toAuditValues(deletedState),
        },
      });

      return deletedState;
    });

    return this.toResponse(state);
  }

  async restore(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<StateResponseDto> {
    const state = await this.prisma.$transaction(async (transaction) => {
      const existingState = await transaction.state.findFirst({
        where: { id, isDeleted: true },
      });

      if (!existingState) {
        throw new NotFoundException('Deleted state not found.');
      }

      const restoredState = await transaction.state.update({
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
          userId: actor.id,
          module: 'STATE',
          entity: 'STATE',
          entityId: id,
          action: 'RESTORE',
          previousValues: this.toAuditValues(existingState),
          newValues: this.toAuditValues(restoredState),
        },
      });

      return restoredState;
    });

    return this.toResponse(state);
  }

  private async findActiveState(id: number): Promise<State> {
    const state = await this.prisma.state.findFirst({
      where: { id, isDeleted: false },
    });

    if (!state) {
      throw new NotFoundException('State not found or has been deleted.');
    }

    return state;
  }

  private async ensureValuesAreUnique(
    stateName: string,
    stateCode: string,
    excludedId?: number,
  ): Promise<void> {
    const duplicate = await this.prisma.state.findFirst({
      where: {
        ...(excludedId ? { id: { not: excludedId } } : {}),
        OR: [{ stateName }, { stateCode }],
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException(
        'A state with the same name or code already exists.',
      );
    }
  }

  private buildWhere(
    search?: string,
    isDeleted?: boolean,
  ): Prisma.StateWhereInput {
    const where: Prisma.StateWhereInput = {
      isDeleted: isDeleted ?? false,
    };

    if (search?.trim()) {
      where.OR = [
        { stateName: { contains: search.trim(), mode: 'insensitive' } },
        { stateCode: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private toResponse(state: State): StateResponseDto {
    return {
      id: state.id,
      stateName: state.stateName,
      stateCode: state.stateCode,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  }

  private toAuditValues(state: State): Prisma.InputJsonValue {
    return {
      id: state.id,
      stateName: state.stateName,
      stateCode: state.stateCode,
      createdAt: state.createdAt.toISOString(),
      updatedAt: state.updatedAt.toISOString(),
      createdById: state.createdById,
      updatedById: state.updatedById,
      isDeleted: state.isDeleted,
      deletedAt: state.deletedAt?.toISOString() ?? null,
      deletedById: state.deletedById,
    };
  }
}
