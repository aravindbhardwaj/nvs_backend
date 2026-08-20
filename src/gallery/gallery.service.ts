import {
  BadRequestException,
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
import {
  formatCalendarDate,
  isInvalidDateRange,
  toCalendarDate,
} from '../common/utils/calendar-date.util';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import {
  GalleryImageResponseDto,
  PublicGalleryImageResponseDto,
} from './dto/gallery-image-response.dto';
import { GetGalleryImagesQueryDto } from './dto/get-gallery-images-query.dto';
import { GetPublicGalleryImagesQueryDto } from './dto/get-public-gallery-images-query.dto';
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
    this.assertDateRange(dto.start_date, dto.end_date);
    const organizationId = dto.organizationId ?? actor.organizationId;
    this.ownership.assertAccess(organizationId, actor);
    await this.ensureActiveOrganization(organizationId);
    const image = await this.prisma.$transaction(async (tx) => {
      const created = await tx.galleryImage.create({
        data: {
          organizationId,
          titleEnglish: dto.titleEnglish,
          titleHindi: dto.titleHindi,
          descriptionEnglish: dto.descriptionEnglish ?? null,
          descriptionHindi: dto.descriptionHindi ?? null,
          altTextEnglish: dto.altTextEnglish ?? null,
          altTextHindi: dto.altTextHindi ?? null,
          storedFilename: file.filename,
          imagePath: this.storedPath(file.path),
          mimeType: file.mimetype,
          extension: this.extension(file.originalname),
          fileSize: BigInt(file.size),
          display_order: dto.display_order ?? 0,
          isActive: dto.isActive ?? true,
          startDate: dto.start_date ? toCalendarDate(dto.start_date) : null,
          endDate: dto.end_date ? toCalendarDate(dto.end_date) : null,
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
    this.assertDateRange(dto.start_date, dto.end_date);
    const organizationId = dto.organizationId ?? actor.organizationId;
    this.ownership.assertAccess(organizationId, actor);
    await this.ensureActiveOrganization(organizationId);
    const images = await this.prisma.$transaction(async (tx) =>
      Promise.all(
        files.map(async (file, index) => {
          const created = await tx.galleryImage.create({
            data: {
              organizationId,
              titleEnglish:
                dto.titleEnglish || this.filenameTitle(file.originalname),
              titleHindi: dto.titleHindi,
              descriptionEnglish: dto.descriptionEnglish ?? null,
              descriptionHindi: dto.descriptionHindi ?? null,
              altTextEnglish: dto.altTextEnglish ?? null,
              altTextHindi: dto.altTextHindi ?? null,
              storedFilename: file.filename,
              imagePath: this.storedPath(file.path),
              mimeType: file.mimetype,
              extension: this.extension(file.originalname),
              fileSize: BigInt(file.size),
              display_order: (dto.display_order ?? 0) + index,
              isActive: dto.isActive ?? true,
              startDate: dto.start_date ? toCalendarDate(dto.start_date) : null,
              endDate: dto.end_date ? toCalendarDate(dto.end_date) : null,
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
    this.assertDateRange(
      dto.start_date === undefined
        ? formatCalendarDate(previous.startDate)
        : dto.start_date,
      dto.end_date === undefined
        ? formatCalendarDate(previous.endDate)
        : dto.end_date,
    );
    const image = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.galleryImage.update({
        where: { id },
        data: {
          titleEnglish: dto.titleEnglish,
          titleHindi: dto.titleHindi,
          descriptionEnglish: dto.descriptionEnglish,
          descriptionHindi: dto.descriptionHindi,
          altTextEnglish: dto.altTextEnglish,
          altTextHindi: dto.altTextHindi,
          display_order: dto.display_order,
          isActive: dto.isActive,
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
        dto.images.map(async ({ id, display_order }) => {
          const previous = images.find((image) => image.id === id)!;
          const updated = await tx.galleryImage.update({
            where: { id },
            data: { display_order, updatedById: actor.id },
          });
          await this.audit(tx, actor.id, 'REORDER', updated, previous);
        }),
      ),
    );
  }

  async findPublic(
    query: GetPublicGalleryImagesQueryDto,
  ): Promise<PaginatedResponseDto<PublicGalleryImageResponseDto>> {
    const where = {
      isDeleted: false,
      isActive: true,
      ...(query.organization_id
        ? { organizationId: query.organization_id }
        : {}),
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
        { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
      ],
    };
    const [images, totalItems] = await this.prisma.$transaction([
      this.prisma.galleryImage.findMany({
        where,
        orderBy: [{ display_order: 'asc' }, { createdAt: 'desc' }],
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
          where: {
            id,
            isDeleted: false,
            isActive: true,
            AND: [
              { OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
              { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
            ],
          },
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
  private assertDateRange(
    startDate?: string | null,
    endDate?: string | null,
  ): void {
    if (isInvalidDateRange(startDate, endDate))
      throw new BadRequestException(
        'End date must not be earlier than start date.',
      );
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
        {
          titleEnglish: { contains: query.search.trim(), mode: 'insensitive' },
        },
        { titleHindi: { contains: query.search.trim(), mode: 'insensitive' } },
        {
          descriptionEnglish: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
        {
          descriptionHindi: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
        {
          altTextEnglish: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
        {
          altTextHindi: { contains: query.search.trim(), mode: 'insensitive' },
        },
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
      titleEnglish: image.titleEnglish,
      titleHindi: image.titleHindi,
      descriptionEnglish: image.descriptionEnglish,
      descriptionHindi: image.descriptionHindi,
      altTextEnglish: image.altTextEnglish,
      altTextHindi: image.altTextHindi,
      imageUrl: `/api/gallery/${image.id}/image`,
      mimeType: image.mimeType,
      extension: image.extension,
      fileSize: image.fileSize.toString(),
      display_order: image.display_order,
      isActive: image.isActive,
      start_date: formatCalendarDate(image.startDate),
      end_date: formatCalendarDate(image.endDate),
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
      isDeleted: image.isDeleted,
    };
  }
  private publicResponse(image: GalleryImage): PublicGalleryImageResponseDto {
    return {
      id: image.id,
      title_english: image.titleEnglish,
      title_hindi: image.titleHindi,
      description_english: image.descriptionEnglish,
      description_hindi: image.descriptionHindi,
      alt_text_english: image.altTextEnglish,
      alt_text_hindi: image.altTextHindi,
      image_url: `/api/public/gallery/${image.id}/image`,
      display_order: image.display_order,
      start_date: formatCalendarDate(image.startDate),
      end_date: formatCalendarDate(image.endDate),
    };
  }
  private auditValues(image: GalleryImage): Prisma.InputJsonValue {
    return {
      id: image.id,
      organizationId: image.organizationId,
      titleEnglish: image.titleEnglish,
      titleHindi: image.titleHindi,
      descriptionEnglish: image.descriptionEnglish,
      descriptionHindi: image.descriptionHindi,
      altTextEnglish: image.altTextEnglish,
      altTextHindi: image.altTextHindi,
      storedFilename: image.storedFilename,
      imagePath: image.imagePath,
      mimeType: image.mimeType,
      extension: image.extension,
      fileSize: image.fileSize.toString(),
      display_order: image.display_order,
      isActive: image.isActive,
      start_date: formatCalendarDate(image.startDate),
      end_date: formatCalendarDate(image.endDate),
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
