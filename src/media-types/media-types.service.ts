import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaType, Prisma } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaTypeDto } from './dto/create-media-type.dto';
import { GetMediaTypesQueryDto } from './dto/get-media-types-query.dto';
import { MediaTypeResponseDto } from './dto/media-type-response.dto';
import { UpdateMediaTypeDto } from './dto/update-media-type.dto';

@Injectable()
export class MediaTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateMediaTypeDto,
    actor: AuthenticatedUser,
  ): Promise<MediaTypeResponseDto> {
    await this.ensureNameIsUnique(dto.nameEnglish);

    const mediaType = await this.prisma.$transaction(async (transaction) => {
      const createdMediaType = await transaction.mediaType.create({
        data: { ...dto, createdById: actor.id, updatedById: actor.id },
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'MEDIA_TYPE',
          entity: 'MEDIA_TYPE',
          entityId: createdMediaType.id,
          action: 'CREATE',
          newValues: this.toAuditValues(createdMediaType),
        },
      });
      return createdMediaType;
    });

    return this.toResponse(mediaType);
  }

  async findAll(
    query: GetMediaTypesQueryDto,
  ): Promise<PaginatedResponseDto<MediaTypeResponseDto>> {
    const { page, limit, search, sort, order, isDeleted } = query;
    const where = this.buildWhere(search, isDeleted);
    const orderBy: Prisma.MediaTypeOrderByWithRelationInput = { [sort]: order };
    const [mediaTypes, totalItems] = await this.prisma.$transaction([
      this.prisma.mediaType.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.mediaType.count({ where }),
    ]);

    return {
      items: mediaTypes.map((mediaType) => this.toResponse(mediaType)),
      meta: PaginationUtil.buildMeta(page, limit, totalItems),
    };
  }

  async findOne(id: number): Promise<MediaTypeResponseDto> {
    return this.toResponse(await this.findActiveMediaType(id));
  }

  async update(
    id: number,
    dto: UpdateMediaTypeDto,
    actor: AuthenticatedUser,
  ): Promise<MediaTypeResponseDto> {
    const existingMediaType = await this.findActiveMediaType(id);
    if (dto.nameEnglish !== undefined)
      await this.ensureNameIsUnique(dto.nameEnglish, id);
    const mediaType = await this.prisma.$transaction(async (transaction) => {
      const updatedMediaType = await transaction.mediaType.update({
        where: { id },
        data: { ...dto, updatedById: actor.id },
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'MEDIA_TYPE',
          entity: 'MEDIA_TYPE',
          entityId: id,
          action: 'UPDATE',
          previousValues: this.toAuditValues(existingMediaType),
          newValues: this.toAuditValues(updatedMediaType),
        },
      });
      return updatedMediaType;
    });

    return this.toResponse(mediaType);
  }

  async remove(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<MediaTypeResponseDto> {
    const mediaType = await this.prisma.$transaction(async (transaction) => {
      const existingMediaType = await transaction.mediaType.findFirst({
        where: { id, isDeleted: false },
      });
      if (!existingMediaType)
        throw new NotFoundException(
          'Media type not found or has already been deleted.',
        );
      const mediaCount = await transaction.media.count({
        where: { mediaTypeId: id },
      });
      const menuCount = await transaction.menu.count({
        where: { mediaTypeId: id, isDeleted: false },
      });
      if (mediaCount > 0 || menuCount > 0)
        throw new ConflictException(
          'Media type cannot be deleted because it is referenced by media records or menus.',
        );
      const deletedMediaType = await transaction.mediaType.update({
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
          module: 'MEDIA_TYPE',
          entity: 'MEDIA_TYPE',
          entityId: id,
          action: 'DELETE',
          previousValues: this.toAuditValues(existingMediaType),
          newValues: this.toAuditValues(deletedMediaType),
        },
      });
      return deletedMediaType;
    });

    return this.toResponse(mediaType);
  }

  async restore(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<MediaTypeResponseDto> {
    const mediaType = await this.prisma.$transaction(async (transaction) => {
      const existingMediaType = await transaction.mediaType.findFirst({
        where: { id, isDeleted: true },
      });
      if (!existingMediaType)
        throw new NotFoundException('Deleted media type not found.');
      const restoredMediaType = await transaction.mediaType.update({
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
          module: 'MEDIA_TYPE',
          entity: 'MEDIA_TYPE',
          entityId: id,
          action: 'RESTORE',
          previousValues: this.toAuditValues(existingMediaType),
          newValues: this.toAuditValues(restoredMediaType),
        },
      });
      return restoredMediaType;
    });

    return this.toResponse(mediaType);
  }

  private async findActiveMediaType(id: number): Promise<MediaType> {
    const mediaType = await this.prisma.mediaType.findFirst({
      where: { id, isDeleted: false },
    });
    if (!mediaType)
      throw new NotFoundException('Media type not found or has been deleted.');
    return mediaType;
  }

  private async ensureNameIsUnique(
    name: string,
    excludedId?: number,
  ): Promise<void> {
    const duplicate = await this.prisma.mediaType.findFirst({
      where: {
        ...(excludedId ? { id: { not: excludedId } } : {}),
        nameEnglish: { equals: name, mode: 'insensitive' },
      },
      select: { id: true },
    });
    if (duplicate)
      throw new ConflictException(
        'A media type with the same name already exists.',
      );
  }

  private buildWhere(
    search?: string,
    isDeleted?: boolean,
  ): Prisma.MediaTypeWhereInput {
    const where: Prisma.MediaTypeWhereInput = { isDeleted: isDeleted ?? false };
    if (search?.trim()) {
      where.OR = [
        { nameEnglish: { contains: search.trim(), mode: 'insensitive' } },
        { nameHindi: { contains: search.trim(), mode: 'insensitive' } },
        {
          descriptionEnglish: { contains: search.trim(), mode: 'insensitive' },
        },
        { descriptionHindi: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    return where;
  }

  private toResponse(mediaType: MediaType): MediaTypeResponseDto {
    return {
      id: mediaType.id,
      nameEnglish: mediaType.nameEnglish,
      nameHindi: mediaType.nameHindi,
      descriptionEnglish: mediaType.descriptionEnglish,
      descriptionHindi: mediaType.descriptionHindi,
      display_order: mediaType.display_order,
      createdAt: mediaType.createdAt,
      updatedAt: mediaType.updatedAt,
    };
  }

  private toAuditValues(mediaType: MediaType): Prisma.InputJsonValue {
    return {
      id: mediaType.id,
      nameEnglish: mediaType.nameEnglish,
      nameHindi: mediaType.nameHindi,
      descriptionEnglish: mediaType.descriptionEnglish,
      descriptionHindi: mediaType.descriptionHindi,
      display_order: mediaType.display_order,
      createdAt: mediaType.createdAt.toISOString(),
      updatedAt: mediaType.updatedAt.toISOString(),
      createdById: mediaType.createdById,
      updatedById: mediaType.updatedById,
      isDeleted: mediaType.isDeleted,
      deletedAt: mediaType.deletedAt?.toISOString() ?? null,
      deletedById: mediaType.deletedById,
    };
  }
}
