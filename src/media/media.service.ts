import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Media, Prisma, Role } from '@prisma/client';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, readFile, unlink } from 'node:fs/promises';
import { basename, relative, resolve } from 'node:path';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { GetMediaQueryDto } from './dto/get-media-query.dto';
import { MediaResponseDto } from './dto/media-response.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UPLOADS_ROOT, validateMediaFile } from './media.storage';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(
    dto: UploadMediaDto,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ): Promise<MediaResponseDto> {
    validateMediaFile(file);
    await this.ensureActiveMediaType(dto.mediaTypeId);
    const media = await this.prisma.$transaction(async (transaction) => {
      const createdMedia = await transaction.media.create({
        data: {
          organizationId: actor.organizationId,
          mediaTypeId: dto.mediaTypeId,
          title: dto.title,
          description: dto.description ?? null,
          originalFilename: this.sanitizeFilename(file.originalname),
          storedFilename: file.filename,
          filePath: this.toStoredPath(file.path),
          mimeType: file.mimetype,
          extension: this.extensionOf(file.originalname),
          fileSize: BigInt(file.size),
          checksum: await this.checksum(file.path),
          createdById: actor.id,
          updatedById: actor.id,
        },
      });
      await this.createAuditLog(transaction, actor.id, 'UPLOAD', createdMedia);
      return createdMedia;
    });
    return this.toResponse(media);
  }

  async findAll(
    query: GetMediaQueryDto,
    actor: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<MediaResponseDto>> {
    if (
      actor.role !== Role.SUPER_ADMIN &&
      query.organizationId &&
      query.organizationId !== actor.organizationId
    ) {
      throw new ForbiddenException(
        'You can only view media belonging to your organization.',
      );
    }
    const where = this.buildWhere(query, actor);
    const orderBy: Prisma.MediaOrderByWithRelationInput = {
      [query.sort]: query.order,
    };
    const [media, totalItems] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.media.count({ where }),
    ]);
    return {
      items: media.map((item) => this.toResponse(item)),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async findOne(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<MediaResponseDto> {
    const media = await this.findActiveMedia(id);
    this.assertOrganizationAccess(media.organizationId, actor);
    return this.toResponse(media);
  }

  async download(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<{
    stream: ReturnType<typeof createReadStream>;
    filename: string;
    mimeType: string;
  }> {
    const media = await this.findActiveMedia(id);
    this.assertOrganizationAccess(media.organizationId, actor);
    const filePath = this.absolutePath(media.filePath);
    try {
      await access(filePath);
    } catch {
      throw new NotFoundException('The document file is no longer available.');
    }
    return {
      stream: createReadStream(filePath),
      filename: media.originalFilename,
      mimeType: media.mimeType,
    };
  }

  async update(
    id: number,
    dto: UpdateMediaDto,
    actor: AuthenticatedUser,
  ): Promise<MediaResponseDto> {
    const existing = await this.findActiveMedia(id);
    this.assertOrganizationAccess(existing.organizationId, actor);
    if (dto.mediaTypeId !== undefined)
      await this.ensureActiveMediaType(dto.mediaTypeId);
    const media = await this.prisma.$transaction(async (transaction) => {
      const updatedMedia = await transaction.media.update({
        where: { id },
        data: { ...dto, updatedById: actor.id },
      });
      await this.createAuditLog(
        transaction,
        actor.id,
        'UPDATE',
        updatedMedia,
        existing,
      );
      return updatedMedia;
    });
    return this.toResponse(media);
  }

  async replaceFile(
    id: number,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ): Promise<MediaResponseDto> {
    validateMediaFile(file);
    const existing = await this.findActiveMedia(id);
    this.assertOrganizationAccess(existing.organizationId, actor);
    const replacementData = {
      originalFilename: this.sanitizeFilename(file.originalname),
      storedFilename: file.filename,
      filePath: this.toStoredPath(file.path),
      mimeType: file.mimetype,
      extension: this.extensionOf(file.originalname),
      fileSize: BigInt(file.size),
      checksum: await this.checksum(file.path),
      uploadedAt: new Date(),
      updatedById: actor.id,
    };
    const media = await this.prisma.$transaction(async (transaction) => {
      const updatedMedia = await transaction.media.update({
        where: { id },
        data: replacementData,
      });
      await this.createAuditLog(
        transaction,
        actor.id,
        'REPLACE',
        updatedMedia,
        existing,
      );
      return updatedMedia;
    });
    try {
      await this.removePhysicalFile(existing.filePath);
    } catch {
      await this.prisma.media.update({
        where: { id },
        data: {
          ...this.mediaFileData(existing),
          updatedById: existing.updatedById,
        },
      });
      await this.removePhysicalFile(replacementData.filePath).catch(
        () => undefined,
      );
      throw new InternalServerErrorException(
        'Unable to replace the existing document file.',
      );
    }
    return this.toResponse(media);
  }

  async remove(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<MediaResponseDto> {
    const media = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.media.findFirst({
        where: { id, isDeleted: false },
      });
      if (!existing)
        throw new NotFoundException(
          'Media not found or has already been deleted.',
        );
      this.assertOrganizationAccess(existing.organizationId, actor);
      const deletedMedia = await transaction.media.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById: actor.id,
          updatedById: actor.id,
        },
      });
      await this.createAuditLog(
        transaction,
        actor.id,
        'DELETE',
        deletedMedia,
        existing,
      );
      return deletedMedia;
    });
    return this.toResponse(media);
  }

  async restore(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<MediaResponseDto> {
    const media = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.media.findFirst({
        where: { id, isDeleted: true },
      });
      if (!existing) throw new NotFoundException('Deleted media not found.');
      this.assertOrganizationAccess(existing.organizationId, actor);
      await this.ensureActiveMediaType(existing.mediaTypeId);
      const restoredMedia = await transaction.media.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null,
          deletedById: null,
          updatedById: actor.id,
        },
      });
      await this.createAuditLog(
        transaction,
        actor.id,
        'RESTORE',
        restoredMedia,
        existing,
      );
      return restoredMedia;
    });
    return this.toResponse(media);
  }

  async cleanupUploadedFile(file?: Express.Multer.File): Promise<void> {
    if (file) await unlink(file.path).catch(() => undefined);
  }

  private async findActiveMedia(id: number): Promise<Media> {
    const media = await this.prisma.media.findFirst({
      where: { id, isDeleted: false },
    });
    if (!media)
      throw new NotFoundException('Media not found or has been deleted.');
    return media;
  }

  private async ensureActiveMediaType(id: number): Promise<void> {
    const mediaType = await this.prisma.mediaType.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });
    if (!mediaType)
      throw new NotFoundException('Media type not found or has been deleted.');
  }

  private buildWhere(
    query: GetMediaQueryDto,
    actor: AuthenticatedUser,
  ): Prisma.MediaWhereInput {
    const where: Prisma.MediaWhereInput = {
      isDeleted: query.isDeleted ?? false,
      ...(query.mediaTypeId ? { mediaTypeId: query.mediaTypeId } : {}),
      ...(actor.role === Role.SUPER_ADMIN
        ? query.organizationId
          ? { organizationId: query.organizationId }
          : {}
        : { organizationId: actor.organizationId }),
    };
    if (query.search?.trim())
      where.OR = [
        { title: { contains: query.search.trim(), mode: 'insensitive' } },
        { description: { contains: query.search.trim(), mode: 'insensitive' } },
        {
          originalFilename: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    return where;
  }

  private assertOrganizationAccess(
    organizationId: number,
    actor: AuthenticatedUser,
  ): void {
    if (
      actor.role !== Role.SUPER_ADMIN &&
      actor.organizationId !== organizationId
    ) {
      throw new ForbiddenException(
        'You can only manage media belonging to your organization.',
      );
    }
  }

  private async createAuditLog(
    transaction: Prisma.TransactionClient,
    userId: number,
    action: string,
    media: Media,
    previousMedia?: Media,
  ): Promise<void> {
    await transaction.auditLog.create({
      data: {
        userId,
        module: 'MEDIA',
        entity: 'MEDIA',
        entityId: media.id,
        action,
        ...(previousMedia
          ? { previousValues: this.toAuditValues(previousMedia) }
          : {}),
        newValues: this.toAuditValues(media),
      },
    });
  }

  private toResponse(media: Media): MediaResponseDto {
    return {
      id: media.id,
      organizationId: media.organizationId,
      mediaTypeId: media.mediaTypeId,
      title: media.title,
      description: media.description,
      originalFilename: media.originalFilename,
      mimeType: media.mimeType,
      extension: media.extension,
      fileSize: media.fileSize.toString(),
      checksum: media.checksum,
      uploadedAt: media.uploadedAt,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
      isDeleted: media.isDeleted,
    };
  }

  private toAuditValues(media: Media): Prisma.InputJsonValue {
    return {
      id: media.id,
      organizationId: media.organizationId,
      mediaTypeId: media.mediaTypeId,
      title: media.title,
      description: media.description,
      originalFilename: media.originalFilename,
      storedFilename: media.storedFilename,
      filePath: media.filePath,
      mimeType: media.mimeType,
      extension: media.extension,
      fileSize: media.fileSize.toString(),
      checksum: media.checksum,
      uploadedAt: media.uploadedAt.toISOString(),
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
      createdById: media.createdById,
      updatedById: media.updatedById,
      isDeleted: media.isDeleted,
      deletedAt: media.deletedAt?.toISOString() ?? null,
      deletedById: media.deletedById,
    };
  }

  private mediaFileData(media: Media) {
    return {
      originalFilename: media.originalFilename,
      storedFilename: media.storedFilename,
      filePath: media.filePath,
      mimeType: media.mimeType,
      extension: media.extension,
      fileSize: media.fileSize,
      checksum: media.checksum,
      uploadedAt: media.uploadedAt,
    };
  }

  private async checksum(filePath: string): Promise<string> {
    return createHash('sha256')
      .update(await readFile(filePath))
      .digest('hex');
  }

  private sanitizeFilename(filename: string): string {
    return basename(filename)
      .replace(/[\x00-\x1f\\/:*?"<>|]/g, '_')
      .slice(0, 255);
  }

  private extensionOf(filename: string): string {
    return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
  }

  private toStoredPath(filePath: string): string {
    return relative(process.cwd(), filePath);
  }

  private absolutePath(filePath: string): string {
    const absolutePath = resolve(process.cwd(), filePath);
    if (!absolutePath.startsWith(`${UPLOADS_ROOT}/`))
      throw new NotFoundException('Document file not found.');
    return absolutePath;
  }

  private async removePhysicalFile(filePath: string): Promise<void> {
    await unlink(this.absolutePath(filePath));
  }
}
