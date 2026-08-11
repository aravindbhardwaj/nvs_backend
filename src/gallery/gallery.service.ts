import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GalleryImage, Prisma, Role } from '@prisma/client';
import { createReadStream } from 'node:fs';
import { access, unlink } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { OrganizationOwnershipService } from '../auth/services/organization-ownership.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import {
  GalleryImageResponseDto,
  PublicGalleryImageResponseDto,
} from './dto/gallery-image-response.dto';
import { GetGalleryImagesQueryDto } from './dto/get-gallery-images-query.dto';
import { ReorderGalleryImagesDto } from './dto/reorder-gallery-images.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { GALLERY_UPLOADS_ROOT, validateGalleryImage } from './gallery.storage';

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: OrganizationOwnershipService,
  ) {}

  async create(
    dto: CreateGalleryImageDto,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ): Promise<GalleryImageResponseDto> {
    await validateGalleryImage(file);
    const organizationId = dto.organizationId ?? actor.organizationId;
    this.ownership.assertAccess(organizationId, actor);
    await this.ensureActiveOrganization(organizationId);
    const image = await this.prisma.$transaction(async (tx) => {
      const created = await tx.galleryImage.create({
        data: {
          organizationId,
          title: dto.title,
          description: dto.description ?? null,
          altText: dto.altText ?? null,
          storedFilename: file.filename,
          imagePath: this.storedPath(file.path),
          mimeType: file.mimetype,
          extension: this.extension(file.originalname),
          fileSize: BigInt(file.size),
          displayOrder: dto.displayOrder ?? 0,
          isActive: dto.isActive ?? true,
          createdById: actor.id,
          updatedById: actor.id,
        },
      });
      await this.audit(tx, actor.id, 'CREATE', created);
      return created;
    });
    return this.response(image);
  }

  async bulkCreate(
    dto: CreateGalleryImageDto,
    files: Express.Multer.File[],
    actor: AuthenticatedUser,
  ): Promise<GalleryImageResponseDto[]> {
    await Promise.all(files.map(validateGalleryImage));
    const organizationId = dto.organizationId ?? actor.organizationId;
    this.ownership.assertAccess(organizationId, actor);
    await this.ensureActiveOrganization(organizationId);
    const images = await this.prisma.$transaction(async (tx) =>
      Promise.all(
        files.map(async (file, index) => {
          const created = await tx.galleryImage.create({
            data: {
              organizationId,
              title: dto.title || this.filenameTitle(file.originalname),
              description: dto.description ?? null,
              altText: dto.altText ?? null,
              storedFilename: file.filename,
              imagePath: this.storedPath(file.path),
              mimeType: file.mimetype,
              extension: this.extension(file.originalname),
              fileSize: BigInt(file.size),
              displayOrder: (dto.displayOrder ?? 0) + index,
              isActive: dto.isActive ?? true,
              createdById: actor.id,
              updatedById: actor.id,
            },
          });
          await this.audit(tx, actor.id, 'BULK_UPLOAD', created);
          return created;
        }),
      ),
    );
    return images.map((image) => this.response(image));
  }

  async findAll(
    query: GetGalleryImagesQueryDto,
    actor: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<GalleryImageResponseDto>> {
    if (query.organizationId)
      this.ownership.assertAccess(query.organizationId, actor);
    const where = this.where(query, actor);
    const [images, totalItems] = await this.prisma.$transaction([
      this.prisma.galleryImage.findMany({
        where,
        orderBy: { [query.sort]: query.order },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.galleryImage.count({ where }),
    ]);
    return {
      items: images.map((image) => this.response(image)),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async findOne(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<GalleryImageResponseDto> {
    const image = await this.active(id);
    this.ownership.assertAccess(image.organizationId, actor);
    return this.response(image);
  }

  async update(
    id: number,
    dto: UpdateGalleryImageDto,
    actor: AuthenticatedUser,
  ): Promise<GalleryImageResponseDto> {
    const previous = await this.active(id);
    this.ownership.assertAccess(previous.organizationId, actor);
    const image = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.galleryImage.update({
        where: { id },
        data: { ...dto, updatedById: actor.id },
      });
      await this.audit(tx, actor.id, 'UPDATE', updated, previous);
      return updated;
    });
    return this.response(image);
  }

  async replaceImage(
    id: number,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ): Promise<GalleryImageResponseDto> {
    await validateGalleryImage(file);
    const previous = await this.active(id);
    this.ownership.assertAccess(previous.organizationId, actor);
    const data = {
      storedFilename: file.filename,
      imagePath: this.storedPath(file.path),
      mimeType: file.mimetype,
      extension: this.extension(file.originalname),
      fileSize: BigInt(file.size),
      updatedById: actor.id,
    };
    const image = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.galleryImage.update({ where: { id }, data });
      await this.audit(tx, actor.id, 'REPLACE_IMAGE', updated, previous);
      return updated;
    });
    try {
      await this.removeFile(previous.imagePath);
    } catch {
      await this.prisma.galleryImage.update({
        where: { id },
        data: {
          storedFilename: previous.storedFilename,
          imagePath: previous.imagePath,
          mimeType: previous.mimeType,
          extension: previous.extension,
          fileSize: previous.fileSize,
          updatedById: previous.updatedById,
        },
      });
      await this.removeFile(data.imagePath).catch(() => undefined);
      throw new InternalServerErrorException(
        'Unable to replace the existing gallery image.',
      );
    }
    return this.response(image);
  }

  async remove(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<GalleryImageResponseDto> {
    const previous = await this.active(id);
    this.ownership.assertAccess(previous.organizationId, actor);
    const image = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.galleryImage.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById: actor.id,
          updatedById: actor.id,
        },
      });
      await this.audit(tx, actor.id, 'DELETE', updated, previous);
      return updated;
    });
    return this.response(image);
  }

  async bulkRemove(
    ids: number[],
    actor: AuthenticatedUser,
  ): Promise<GalleryImageResponseDto[]> {
    const images = await this.prisma.galleryImage.findMany({
      where: { id: { in: ids }, isDeleted: false },
    });
    if (images.length !== ids.length)
      throw new NotFoundException('One or more gallery images were not found.');
    images.forEach((image) =>
      this.ownership.assertAccess(image.organizationId, actor),
    );
    const deleted = await this.prisma.$transaction(async (tx) =>
      Promise.all(
        images.map(async (previous) => {
          const updated = await tx.galleryImage.update({
            where: { id: previous.id },
            data: {
              isDeleted: true,
              deletedAt: new Date(),
              deletedById: actor.id,
              updatedById: actor.id,
            },
          });
          await this.audit(tx, actor.id, 'DELETE', updated, previous);
          return updated;
        }),
      ),
    );
    return deleted.map((image) => this.response(image));
  }

  async reorder(
    dto: ReorderGalleryImagesDto,
    actor: AuthenticatedUser,
  ): Promise<void> {
    const images = await this.prisma.galleryImage.findMany({
      where: { id: { in: dto.images.map(({ id }) => id) }, isDeleted: false },
    });
    if (images.length !== dto.images.length)
      throw new NotFoundException('One or more gallery images were not found.');
    images.forEach((image) =>
      this.ownership.assertAccess(image.organizationId, actor),
    );
    await this.prisma.$transaction(async (tx) =>
      Promise.all(
        dto.images.map(async ({ id, displayOrder }) => {
          const previous = images.find((image) => image.id === id)!;
          const updated = await tx.galleryImage.update({
            where: { id },
            data: { displayOrder, updatedById: actor.id },
          });
          await this.audit(tx, actor.id, 'REORDER', updated, previous);
        }),
      ),
    );
  }

  async findPublic(
    query: GetGalleryImagesQueryDto,
  ): Promise<PaginatedResponseDto<PublicGalleryImageResponseDto>> {
    const where = {
      isDeleted: false,
      isActive: true,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
    };
    const [images, totalItems] = await this.prisma.$transaction([
      this.prisma.galleryImage.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.galleryImage.count({ where }),
    ]);
    return {
      items: images.map((image) => this.publicResponse(image)),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async imageStream(
    id: number,
    actor?: AuthenticatedUser,
  ): Promise<{
    stream: ReturnType<typeof createReadStream>;
    mimeType: string;
  }> {
    const image = actor
      ? await this.active(id)
      : await this.prisma.galleryImage.findFirst({
          where: { id, isDeleted: false, isActive: true },
        });
    if (!image) throw new NotFoundException('Gallery image not found.');
    if (actor) this.ownership.assertAccess(image.organizationId, actor);
    const path = this.absolutePath(image.imagePath);
    await access(path).catch(() => {
      throw new NotFoundException('The gallery image is no longer available.');
    });
    return { stream: createReadStream(path), mimeType: image.mimeType };
  }
  async cleanupUploadedFiles(files: Express.Multer.File[] = []): Promise<void> {
    await Promise.all(
      files.map((file) => unlink(file.path).catch(() => undefined)),
    );
  }
  private async active(id: number): Promise<GalleryImage> {
    const image = await this.prisma.galleryImage.findFirst({
      where: { id, isDeleted: false },
    });
    if (!image)
      throw new NotFoundException(
        'Gallery image not found or has been deleted.',
      );
    return image;
  }
  private async ensureActiveOrganization(id: number): Promise<void> {
    const organization = await this.prisma.organization.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });
    if (!organization)
      throw new NotFoundException(
        'Organization not found or has been deleted.',
      );
  }
  private where(
    query: GetGalleryImagesQueryDto,
    actor: AuthenticatedUser,
  ): Prisma.GalleryImageWhereInput {
    const where: Prisma.GalleryImageWhereInput = {
      isDeleted: query.isDeleted ?? false,
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
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
        { altText: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    return where;
  }
  private async audit(
    tx: Prisma.TransactionClient,
    userId: number,
    action: string,
    image: GalleryImage,
    previous?: GalleryImage,
  ): Promise<void> {
    await tx.auditLog.create({
      data: {
        userId,
        module: 'GALLERY',
        entity: 'GALLERY_IMAGE',
        entityId: image.id,
        action,
        ...(previous ? { previousValues: this.auditValues(previous) } : {}),
        newValues: this.auditValues(image),
      },
    });
  }
  private response(image: GalleryImage): GalleryImageResponseDto {
    return {
      id: image.id,
      organizationId: image.organizationId,
      title: image.title,
      description: image.description,
      altText: image.altText,
      imageUrl: `/api/gallery/${image.id}/image`,
      mimeType: image.mimeType,
      extension: image.extension,
      fileSize: image.fileSize.toString(),
      displayOrder: image.displayOrder,
      isActive: image.isActive,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
      isDeleted: image.isDeleted,
    };
  }
  private publicResponse(image: GalleryImage): PublicGalleryImageResponseDto {
    return {
      id: image.id,
      organizationId: image.organizationId,
      title: image.title,
      description: image.description,
      altText: image.altText,
      imageUrl: `/api/public/gallery/${image.id}/image`,
      displayOrder: image.displayOrder,
      createdAt: image.createdAt,
    };
  }
  private auditValues(image: GalleryImage): Prisma.InputJsonValue {
    return {
      id: image.id,
      organizationId: image.organizationId,
      title: image.title,
      description: image.description,
      altText: image.altText,
      storedFilename: image.storedFilename,
      imagePath: image.imagePath,
      mimeType: image.mimeType,
      extension: image.extension,
      fileSize: image.fileSize.toString(),
      displayOrder: image.displayOrder,
      isActive: image.isActive,
      isDeleted: image.isDeleted,
    };
  }
  private extension(filename: string): string {
    return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
  }
  private filenameTitle(filename: string): string {
    return filename.replace(/\.[^.]+$/, '').slice(0, 255);
  }
  private storedPath(filePath: string): string {
    return relative(process.cwd(), filePath);
  }
  private absolutePath(filePath: string): string {
    const path = resolve(process.cwd(), filePath);
    if (!path.startsWith(`${GALLERY_UPLOADS_ROOT}/`))
      throw new NotFoundException('Gallery image not found.');
    return path;
  }
  private async removeFile(filePath: string): Promise<void> {
    await unlink(this.absolutePath(filePath));
  }
}
