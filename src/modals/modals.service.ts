import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Modal, Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import {
  formatCalendarDate,
  isInvalidDateRange,
  toCalendarDate,
} from '../common/utils/calendar-date.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModalDto } from './dto/create-modal.dto';
import { GetModalsQueryDto } from './dto/get-modals-query.dto';
import { GetPublicModalsQueryDto } from './dto/get-public-modals-query.dto';
import {
  ModalResponseDto,
  PublicModalResponseDto,
} from './dto/modal-response.dto';
import { ReorderModalsDto } from './dto/reorder-modals.dto';
import { UpdateModalDto } from './dto/update-modal.dto';

@Injectable()
export class ModalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateModalDto,
    actor: AuthenticatedUser,
  ): Promise<ModalResponseDto> {
    this.assertDisplayDates(dto.start_date, dto.end_date);
    const modal = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.modal.create({
        data: {
          textEnglish: dto.text_english,
          textHindi: dto.text_hindi,
          link: dto.link,
          display_order: dto.display_order ?? 0,
          isActive: dto.isActive ?? true,
          startDate: dto.start_date ? toCalendarDate(dto.start_date) : null,
          endDate: dto.end_date ? toCalendarDate(dto.end_date) : null,
          createdById: actor.id,
          updatedById: actor.id,
        },
      });
      await this.createAuditLog(transaction, actor.id, 'CREATE', created);
      return created;
    });
    return this.toResponse(modal);
  }

  async findAll(
    query: GetModalsQueryDto,
  ): Promise<PaginatedResponseDto<ModalResponseDto>> {
    const where: Prisma.ModalWhereInput = {
      isDeleted: query.isDeleted ?? false,
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.search?.trim()
        ? {
            OR: [
              {
                textEnglish: {
                  contains: query.search.trim(),
                  mode: 'insensitive' as const,
                },
              },
              {
                textHindi: {
                  contains: query.search.trim(),
                  mode: 'insensitive' as const,
                },
              },
              {
                link: {
                  contains: query.search.trim(),
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };
    const [modals, totalItems] = await this.prisma.$transaction([
      this.prisma.modal.findMany({
        where,
        orderBy: { [this.sortField(query.sort)]: query.order },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.modal.count({ where }),
    ]);
    return {
      items: modals.map((modal) => this.toResponse(modal)),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async findOne(id: number): Promise<ModalResponseDto> {
    return this.toResponse(await this.findExisting(id));
  }

  async update(
    id: number,
    dto: UpdateModalDto,
    actor: AuthenticatedUser,
  ): Promise<ModalResponseDto> {
    const existing = await this.findExisting(id);
    this.assertDisplayDates(
      dto.start_date === undefined
        ? formatCalendarDate(existing.startDate)
        : dto.start_date,
      dto.end_date === undefined
        ? formatCalendarDate(existing.endDate)
        : dto.end_date,
    );
    const modal = await this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.modal.update({
        where: { id },
        data: {
          ...(dto.text_english === undefined
            ? {}
            : { textEnglish: dto.text_english }),
          ...(dto.text_hindi === undefined
            ? {}
            : { textHindi: dto.text_hindi }),
          ...(dto.link === undefined ? {} : { link: dto.link }),
          ...(dto.display_order === undefined
            ? {}
            : { display_order: dto.display_order }),
          ...(dto.isActive === undefined ? {} : { isActive: dto.isActive }),
          ...(dto.start_date === undefined
            ? {}
            : {
                startDate: dto.start_date
                  ? toCalendarDate(dto.start_date)
                  : null,
              }),
          ...(dto.end_date === undefined
            ? {}
            : { endDate: dto.end_date ? toCalendarDate(dto.end_date) : null }),
          updatedById: actor.id,
        },
      });
      await this.createAuditLog(
        transaction,
        actor.id,
        'UPDATE',
        updated,
        existing,
      );
      return updated;
    });
    return this.toResponse(modal);
  }

  async setActive(
    id: number,
    isActive: boolean,
    actor: AuthenticatedUser,
  ): Promise<ModalResponseDto> {
    const existing = await this.findExisting(id);
    const modal = await this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.modal.update({
        where: { id },
        data: { isActive, updatedById: actor.id },
      });
      await this.createAuditLog(
        transaction,
        actor.id,
        isActive ? 'ACTIVATE' : 'DEACTIVATE',
        updated,
        existing,
      );
      return updated;
    });
    return this.toResponse(modal);
  }

  async reorder(
    dto: ReorderModalsDto,
    actor: AuthenticatedUser,
  ): Promise<void> {
    const ids = dto.items.map((item) => item.id);
    if (new Set(ids).size !== ids.length) {
      throw new NotFoundException('One or more modals were not found.');
    }
    await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.modal.findMany({
        where: { id: { in: ids }, isDeleted: false },
      });
      if (existing.length !== ids.length) {
        throw new NotFoundException('One or more modals were not found.');
      }
      for (const item of dto.items) {
        const previous = existing.find((modal) => modal.id === item.id)!;
        const updated = await transaction.modal.update({
          where: { id: item.id },
          data: { display_order: item.display_order, updatedById: actor.id },
        });
        await this.createAuditLog(
          transaction,
          actor.id,
          'REORDER',
          updated,
          previous,
        );
      }
    });
  }

  async remove(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<ModalResponseDto> {
    const existing = await this.findExisting(id);
    const modal = await this.prisma.$transaction(async (transaction) => {
      const deleted = await transaction.modal.update({
        where: { id },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: new Date(),
          deletedById: actor.id,
          updatedById: actor.id,
        },
      });
      await this.createAuditLog(
        transaction,
        actor.id,
        'DELETE',
        deleted,
        existing,
      );
      return deleted;
    });
    return this.toResponse(modal);
  }

  async findPublic(
    query: GetPublicModalsQueryDto,
  ): Promise<PaginatedResponseDto<PublicModalResponseDto>> {
    const where: Prisma.ModalWhereInput = {
      isActive: true,
      isDeleted: false,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
        { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
      ],
      ...(query.search?.trim()
        ? {
            OR: [
              {
                textEnglish: {
                  contains: query.search.trim(),
                  mode: 'insensitive' as const,
                },
              },
              {
                textHindi: {
                  contains: query.search.trim(),
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };
    const [modals, totalItems] = await this.prisma.$transaction([
      this.prisma.modal.findMany({
        where,
        orderBy: [{ display_order: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.modal.count({ where }),
    ]);
    return {
      items: modals.map((modal) => this.toPublicResponse(modal)),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  private async findExisting(id: number): Promise<Modal> {
    const modal = await this.prisma.modal.findFirst({
      where: { id, isDeleted: false },
    });
    if (!modal) throw new NotFoundException('Modal not found or deleted.');
    return modal;
  }

  private async createAuditLog(
    transaction: Prisma.TransactionClient,
    userId: number,
    action: string,
    modal: Modal,
    previousModal?: Modal,
  ): Promise<void> {
    await transaction.auditLog.create({
      data: {
        userId,
        module: 'MODAL',
        entity: 'MODAL',
        entityId: modal.id,
        action,
        ...(previousModal
          ? { previousValues: this.toAuditValues(previousModal) }
          : {}),
        newValues: this.toAuditValues(modal),
      },
    });
  }

  private toResponse(modal: Modal): ModalResponseDto {
    return {
      id: modal.id,
      text_english: modal.textEnglish,
      text_hindi: modal.textHindi,
      link: modal.link,
      display_order: modal.display_order,
      isActive: modal.isActive,
      start_date: formatCalendarDate(modal.startDate),
      end_date: formatCalendarDate(modal.endDate),
      createdAt: modal.createdAt,
      updatedAt: modal.updatedAt,
      isDeleted: modal.isDeleted,
    };
  }

  private toPublicResponse(modal: Modal): PublicModalResponseDto {
    return {
      id: modal.id,
      text_english: modal.textEnglish,
      text_hindi: modal.textHindi,
      link: modal.link,
      display_order: modal.display_order,
      start_date: formatCalendarDate(modal.startDate),
      end_date: formatCalendarDate(modal.endDate),
    };
  }

  private toAuditValues(modal: Modal): Prisma.InputJsonValue {
    return {
      id: modal.id,
      text_english: modal.textEnglish,
      text_hindi: modal.textHindi,
      link: modal.link,
      display_order: modal.display_order,
      isActive: modal.isActive,
      start_date: formatCalendarDate(modal.startDate),
      end_date: formatCalendarDate(modal.endDate),
      isDeleted: modal.isDeleted,
      deletedAt: modal.deletedAt?.toISOString() ?? null,
    };
  }

  private sortField(sort: GetModalsQueryDto['sort']): string {
    if (sort === 'text_english') return 'textEnglish';
    if (sort === 'text_hindi') return 'textHindi';
    if (sort === 'start_date') return 'startDate';
    if (sort === 'end_date') return 'endDate';
    return sort;
  }

  private assertDisplayDates(
    startDate?: string | null,
    endDate?: string | null,
  ): void {
    if (isInvalidDateRange(startDate, endDate)) {
      throw new BadRequestException(
        'End date must not be earlier than start date.',
      );
    }
  }
}
