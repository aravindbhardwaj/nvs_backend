import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentType, Prisma } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { ContentTypeResponseDto } from './dto/content-type-response.dto';
import { GetContentTypesQueryDto } from './dto/get-content-types-query.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';

@Injectable()
export class ContentTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateContentTypeDto,
    actor: AuthenticatedUser,
  ): Promise<ContentTypeResponseDto> {
    await this.ensureNameIsUnique(dto.nameEnglish);

    const contentType = await this.prisma.$transaction(async (transaction) => {
      const createdContentType = await transaction.contentType.create({
        data: { ...dto, createdById: actor.id, updatedById: actor.id },
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'CONTENT_TYPE',
          entity: 'CONTENT_TYPE',
          entityId: createdContentType.id,
          action: 'CREATE',
          newValues: this.toAuditValues(createdContentType),
        },
      });
      return createdContentType;
    });

    return this.toResponse(contentType);
  }

  async findAll(
    query: GetContentTypesQueryDto,
  ): Promise<PaginatedResponseDto<ContentTypeResponseDto>> {
    const { page, limit, search, sort, order, isDeleted } = query;
    const where = this.buildWhere(search, isDeleted);
    const orderBy: Prisma.ContentTypeOrderByWithRelationInput = {
      [sort]: order,
    };
    const [contentTypes, totalItems] = await this.prisma.$transaction([
      this.prisma.contentType.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contentType.count({ where }),
    ]);

    return {
      items: contentTypes.map((contentType) => this.toResponse(contentType)),
      meta: PaginationUtil.buildMeta(page, limit, totalItems),
    };
  }

  async findOne(id: number): Promise<ContentTypeResponseDto> {
    return this.toResponse(await this.findActiveContentType(id));
  }

  async update(
    id: number,
    dto: UpdateContentTypeDto,
    actor: AuthenticatedUser,
  ): Promise<ContentTypeResponseDto> {
    const existingContentType = await this.findActiveContentType(id);
    if (dto.nameEnglish !== undefined)
      await this.ensureNameIsUnique(dto.nameEnglish, id);
    const contentType = await this.prisma.$transaction(async (transaction) => {
      const updatedContentType = await transaction.contentType.update({
        where: { id },
        data: { ...dto, updatedById: actor.id },
      });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          module: 'CONTENT_TYPE',
          entity: 'CONTENT_TYPE',
          entityId: id,
          action: 'UPDATE',
          previousValues: this.toAuditValues(existingContentType),
          newValues: this.toAuditValues(updatedContentType),
        },
      });
      return updatedContentType;
    });

    return this.toResponse(contentType);
  }

  async remove(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<ContentTypeResponseDto> {
    const contentType = await this.prisma.$transaction(async (transaction) => {
      const existingContentType = await transaction.contentType.findFirst({
        where: { id, isDeleted: false },
      });
      if (!existingContentType)
        throw new NotFoundException(
          'Content type not found or has already been deleted.',
        );
      const pageCount = await transaction.page.count({
        where: { contentTypeId: id },
      });
      if (pageCount > 0)
        throw new ConflictException(
          'Content type cannot be deleted because it is referenced by pages.',
        );
      const deletedContentType = await transaction.contentType.update({
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
          module: 'CONTENT_TYPE',
          entity: 'CONTENT_TYPE',
          entityId: id,
          action: 'DELETE',
          previousValues: this.toAuditValues(existingContentType),
          newValues: this.toAuditValues(deletedContentType),
        },
      });
      return deletedContentType;
    });

    return this.toResponse(contentType);
  }

  async restore(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<ContentTypeResponseDto> {
    const contentType = await this.prisma.$transaction(async (transaction) => {
      const existingContentType = await transaction.contentType.findFirst({
        where: { id, isDeleted: true },
      });
      if (!existingContentType)
        throw new NotFoundException('Deleted content type not found.');
      const restoredContentType = await transaction.contentType.update({
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
          module: 'CONTENT_TYPE',
          entity: 'CONTENT_TYPE',
          entityId: id,
          action: 'RESTORE',
          previousValues: this.toAuditValues(existingContentType),
          newValues: this.toAuditValues(restoredContentType),
        },
      });
      return restoredContentType;
    });

    return this.toResponse(contentType);
  }

  private async findActiveContentType(id: number): Promise<ContentType> {
    const contentType = await this.prisma.contentType.findFirst({
      where: { id, isDeleted: false },
    });
    if (!contentType)
      throw new NotFoundException(
        'Content type not found or has been deleted.',
      );
    return contentType;
  }

  private async ensureNameIsUnique(
    name: string,
    excludedId?: number,
  ): Promise<void> {
    const duplicate = await this.prisma.contentType.findFirst({
      where: {
        ...(excludedId ? { id: { not: excludedId } } : {}),
        nameEnglish: { equals: name, mode: 'insensitive' },
      },
      select: { id: true },
    });
    if (duplicate)
      throw new ConflictException(
        'A content type with the same name already exists.',
      );
  }

  private buildWhere(
    search?: string,
    isDeleted?: boolean,
  ): Prisma.ContentTypeWhereInput {
    const where: Prisma.ContentTypeWhereInput = {
      isDeleted: isDeleted ?? false,
    };
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

  private toResponse(contentType: ContentType): ContentTypeResponseDto {
    return {
      id: contentType.id,
      nameEnglish: contentType.nameEnglish,
      nameHindi: contentType.nameHindi,
      descriptionEnglish: contentType.descriptionEnglish,
      descriptionHindi: contentType.descriptionHindi,
      displayOrder: contentType.displayOrder,
      createdAt: contentType.createdAt,
      updatedAt: contentType.updatedAt,
    };
  }

  private toAuditValues(contentType: ContentType): Prisma.InputJsonValue {
    return {
      id: contentType.id,
      nameEnglish: contentType.nameEnglish,
      nameHindi: contentType.nameHindi,
      descriptionEnglish: contentType.descriptionEnglish,
      descriptionHindi: contentType.descriptionHindi,
      displayOrder: contentType.displayOrder,
      createdAt: contentType.createdAt.toISOString(),
      updatedAt: contentType.updatedAt.toISOString(),
      createdById: contentType.createdById,
      updatedById: contentType.updatedById,
      isDeleted: contentType.isDeleted,
      deletedAt: contentType.deletedAt?.toISOString() ?? null,
      deletedById: contentType.deletedById,
    };
  }
}
