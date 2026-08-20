import {
  BadRequestException,
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
import { OrganizationOwnershipService } from '../auth/services/organization-ownership.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import {
  formatCalendarDate,
  isInvalidDateRange,
  toCalendarDate,
} from '../common/utils/calendar-date.util';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { GetMediaQueryDto } from './dto/get-media-query.dto';
import { GetPublicMediaQueryDto } from './dto/get-public-media-query.dto';
import { MediaResponseDto } from './dto/media-response.dto';
import { PublicMediaResponseDto } from './dto/public-media-response.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UPLOADS_ROOT, validateMediaFile } from './media.storage';

type ImportantLinkField =
  'importantLink1' | 'importantLink2' | 'importantLink3';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: OrganizationOwnershipService,
  ) {}

  async upload(
    dto: UploadMediaDto,
    file: Express.Multer.File,
    hindiFile: Express.Multer.File | undefined,
    actor: AuthenticatedUser,
  ): Promise<MediaResponseDto> {
    validateMediaFile(file);
    if (hindiFile) validateMediaFile(hindiFile);
    this.assertDateRange(dto.start_date, dto.end_date);
    const organizationId = dto.organizationId ?? actor.organizationId;
    this.ownership.assertAccess(organizationId, actor);
    await this.ensureActiveOrganization(organizationId);
    await this.ensureActiveMediaType(dto.mediaTypeId);
    const visibility = await this.resolveVisibility(dto, organizationId);
    const media = await this.prisma.$transaction(async (transaction) => {
      const createdMedia = await transaction.media.create({
        data: {
          organizationId,
          mediaTypeId: dto.mediaTypeId,
          titleEnglish: dto.titleEnglish,
          titleHindi: dto.titleHindi,
          descriptionEnglish: dto.descriptionEnglish ?? null,
          descriptionHindi: dto.descriptionHindi ?? null,
          startDate: dto.start_date ? toCalendarDate(dto.start_date) : null,
          endDate: dto.end_date ? toCalendarDate(dto.end_date) : null,
          originalFilename: this.sanitizeFilename(file.originalname),
          storedFilename: file.filename,
          filePath: this.toStoredPath(file.path),
          mimeType: file.mimetype,
          extension: this.extensionOf(file.originalname),
          fileSize: BigInt(file.size),
          checksum: await this.checksum(file.path),
          ...(hindiFile ? await this.hindiFileData(hindiFile) : {}),
          display_order: dto.display_order ?? 0,
          isActive: dto.is_active ?? true,
          visibleToAll: visibility.visibleToAll,
          roIds: visibility.roIds,
          visibleToJnv: visibility.visibleToJnv,
          importantLink1: dto.important_link_1 ?? null,
          importantLink2: dto.important_link_2 ?? null,
          importantLink3: dto.important_link_3 ?? null,
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
    if (query.organizationId)
      this.ownership.assertAccess(query.organizationId, actor);
    const where = await this.buildWhere(query, actor);
    const orderBy = this.orderBy(query);
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
    const media = await this.findViewableMedia(id, actor);
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
    const media = await this.findViewableMedia(id, actor);
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

  async downloadHindi(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<{
    stream: ReturnType<typeof createReadStream>;
    filename: string;
    mimeType: string;
  }> {
    const media = await this.findViewableMedia(id, actor);
    if (
      !media.hindiFilePath ||
      !media.hindiOriginalFilename ||
      !media.hindiMimeType
    )
      throw new NotFoundException('Hindi document file is not available.');
    const filePath = this.absolutePath(media.hindiFilePath);
    try {
      await access(filePath);
    } catch {
      throw new NotFoundException(
        'The Hindi document file is no longer available.',
      );
    }
    return {
      stream: createReadStream(filePath),
      filename: media.hindiOriginalFilename,
      mimeType: media.hindiMimeType,
    };
  }

  async update(
    id: number,
    dto: UpdateMediaDto,
    actor: AuthenticatedUser,
  ): Promise<MediaResponseDto> {
    const existing = await this.findActiveMedia(id);
    this.ownership.assertAccess(existing.organizationId, actor);
    if (dto.mediaTypeId !== undefined)
      await this.ensureActiveMediaType(dto.mediaTypeId);
    this.assertDateRange(
      dto.start_date === undefined
        ? formatCalendarDate(existing.startDate)
        : dto.start_date,
      dto.end_date === undefined
        ? formatCalendarDate(existing.endDate)
        : dto.end_date,
    );
    const visibility = await this.resolveVisibility(
      dto,
      existing.organizationId,
      existing,
    );
    const media = await this.prisma.$transaction(async (transaction) => {
      const updatedMedia = await transaction.media.update({
        where: { id },
        data: {
          titleEnglish: dto.titleEnglish,
          titleHindi: dto.titleHindi,
          descriptionEnglish: dto.descriptionEnglish,
          descriptionHindi: dto.descriptionHindi,
          mediaTypeId: dto.mediaTypeId,
          display_order: dto.display_order,
          isActive: dto.is_active,
          ...(dto.visible_to_all === undefined
            ? {}
            : { visibleToAll: visibility.visibleToAll }),
          ...(dto.ro_ids === undefined ? {} : { roIds: visibility.roIds }),
          ...(dto.visible_to_jnv === undefined
            ? {}
            : { visibleToJnv: visibility.visibleToJnv }),
          ...(dto.important_link_1 === undefined
            ? {}
            : { importantLink1: dto.important_link_1 }),
          ...(dto.important_link_2 === undefined
            ? {}
            : { importantLink2: dto.important_link_2 }),
          ...(dto.important_link_3 === undefined
            ? {}
            : { importantLink3: dto.important_link_3 }),
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
    this.ownership.assertAccess(existing.organizationId, actor);
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
      this.ownership.assertAccess(existing.organizationId, actor);
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
      this.ownership.assertAccess(existing.organizationId, actor);
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

  async cleanupUploadedFiles(
    files: Array<Express.Multer.File | undefined>,
  ): Promise<void> {
    await Promise.all(
      files
        .filter((file): file is Express.Multer.File => Boolean(file))
        .map((file) => unlink(file.path).catch(() => undefined)),
    );
  }

  async cleanupUploadedFile(file?: Express.Multer.File): Promise<void> {
    await this.cleanupUploadedFiles([file]);
  }

  async findPublic(
    query: GetPublicMediaQueryDto,
  ): Promise<PaginatedResponseDto<PublicMediaResponseDto>> {
    const where = await this.publicWhere(query);
    const [media, totalItems] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where,
        orderBy: [{ display_order: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.media.count({ where }),
    ]);
    return {
      items: media.map((item) =>
        this.toPublicResponse(item, query.organization_id),
      ),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async findImportantLinks(
    query: GetPublicMediaQueryDto,
    importantLink: ImportantLinkField,
  ): Promise<PaginatedResponseDto<PublicMediaResponseDto>> {
    const where = await this.publicWhere(query, importantLink);
    const [media, totalItems] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where,
        orderBy: [{ display_order: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.media.count({ where }),
    ]);
    return {
      items: media.map((item) =>
        this.toPublicResponse(item, query.organization_id),
      ),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async publicDownload(
    id: number,
    organizationId?: number,
  ): Promise<{
    stream: ReturnType<typeof createReadStream>;
    filename: string;
    mimeType: string;
  }> {
    if (
      organizationId !== undefined &&
      (!Number.isSafeInteger(organizationId) || organizationId < 1)
    )
      throw new BadRequestException(
        'organization_id must be a positive integer.',
      );
    const media = await this.prisma.media.findFirst({
      where: {
        id,
        ...(await this.publicWhere({ organization_id: organizationId })),
      },
    });
    if (!media) throw new NotFoundException('Public media not found.');
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

  private async findActiveMedia(id: number): Promise<Media> {
    const media = await this.prisma.media.findFirst({
      where: { id, isDeleted: false },
    });
    if (!media)
      throw new NotFoundException('Media not found or has been deleted.');
    return media;
  }

  private async findViewableMedia(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<Media> {
    const visibilityWhere = await this.visibilityWhere({}, actor);
    const media = await this.prisma.media.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(visibilityWhere ? { AND: [visibilityWhere] } : {}),
      },
    });
    if (!media)
      throw new NotFoundException('Media not found or has been deleted.');
    return media;
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

  private async ensureActiveMediaType(id: number): Promise<void> {
    const mediaType = await this.prisma.mediaType.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });
    if (!mediaType)
      throw new NotFoundException('Media type not found or has been deleted.');
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

  private async resolveVisibility(
    dto: Pick<
      UploadMediaDto | UpdateMediaDto,
      'visible_to_all' | 'ro_ids' | 'visible_to_jnv'
    >,
    organizationId: number,
    existing?: Media,
  ): Promise<{
    visibleToAll: boolean | null;
    roIds: string | null;
    visibleToJnv: boolean | null;
  }> {
    const visibleToAll =
      dto.visible_to_all === undefined
        ? (existing?.visibleToAll ?? null)
        : (dto.visible_to_all ?? null);
    const roIds =
      dto.ro_ids === undefined
        ? (existing?.roIds ?? null)
        : this.normalizeRoIds(dto.ro_ids);
    const visibleToJnv =
      dto.visible_to_jnv === undefined
        ? (existing?.visibleToJnv ?? null)
        : (dto.visible_to_jnv ?? null);

    if (visibleToAll === true && (roIds !== null || visibleToJnv === true))
      throw new BadRequestException(
        'visible_to_all=true cannot be combined with ro_ids or visible_to_jnv=true.',
      );
    if (visibleToJnv === true && roIds === null)
      throw new BadRequestException(
        'visible_to_jnv=true requires at least one Regional Office in ro_ids.',
      );

    if (roIds !== null) {
      await this.ensureHeadquartersSelectiveSharing(organizationId);
      await this.ensureRegionalOffices(roIds);
    }
    return { visibleToAll, roIds, visibleToJnv };
  }

  private normalizeRoIds(value: string | null): string | null {
    if (value === null) return null;
    const tokens = value.split(',');
    if (
      tokens.length === 0 ||
      tokens.some((token) => !/^\d+$/.test(token.trim()))
    )
      throw new BadRequestException(
        'ro_ids must be a comma-separated list of Regional Office IDs.',
      );
    const ids = [...new Set(tokens.map((token) => Number(token.trim())))];
    if (ids.some((id) => !Number.isSafeInteger(id) || id < 1))
      throw new BadRequestException(
        'ro_ids must contain positive Regional Office IDs.',
      );
    return ids.join(',');
  }

  private async ensureHeadquartersSelectiveSharing(
    organizationId: number,
  ): Promise<void> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        isDeleted: false,
        organizationType: { code: 'HEADQUARTER', isActive: true },
      },
      select: { id: true },
    });
    if (!organization)
      throw new BadRequestException(
        'Selective Regional Office sharing is available only for Headquarters media.',
      );
  }

  private async ensureRegionalOffices(roIds: string): Promise<void> {
    const ids = roIds.split(',').map(Number);
    const organizations = await this.prisma.organization.findMany({
      where: {
        id: { in: ids },
        isDeleted: false,
        organizationType: { code: 'REGIONAL_OFFICE', isActive: true },
      },
      select: { id: true },
    });
    if (organizations.length !== ids.length)
      throw new BadRequestException(
        'Every ro_ids value must identify an active Regional Office.',
      );
  }

  private async buildWhere(
    query: GetMediaQueryDto,
    actor: AuthenticatedUser,
  ): Promise<Prisma.MediaWhereInput> {
    const where: Prisma.MediaWhereInput = {
      isDeleted: query.isDeleted ?? false,
      ...(query.mediaTypeId ? { mediaTypeId: query.mediaTypeId } : {}),
      ...(query.is_active === undefined ? {} : { isActive: query.is_active }),
    };
    const visibilityWhere = await this.visibilityWhere(query, actor);
    if (visibilityWhere) where.AND = [visibilityWhere];
    if (query.search?.trim()) {
      const searchWhere: Prisma.MediaWhereInput = {
        OR: [
          {
            titleEnglish: {
              contains: query.search.trim(),
              mode: 'insensitive',
            },
          },
          {
            titleHindi: { contains: query.search.trim(), mode: 'insensitive' },
          },
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
            originalFilename: {
              contains: query.search.trim(),
              mode: 'insensitive',
            },
          },
        ],
      };
      const existingAnd = where.AND
        ? Array.isArray(where.AND)
          ? where.AND
          : [where.AND]
        : [];
      where.AND = [...existingAnd, searchWhere];
    }
    return where;
  }

  private async visibilityWhere(
    query: Pick<GetMediaQueryDto, 'organizationId'>,
    actor: AuthenticatedUser,
  ): Promise<Prisma.MediaWhereInput | undefined> {
    if (actor.role === Role.SUPER_ADMIN) {
      return query.organizationId
        ? { organizationId: query.organizationId }
        : undefined;
    }

    if (query.organizationId) return { organizationId: actor.organizationId };

    const headquartersShared: Prisma.MediaWhereInput = {
      visibleToAll: true,
      organization: { organizationType: { code: 'HEADQUARTER' } },
    };
    const headquartersSelectiveForRo = (
      roId: number,
      forJnv = false,
    ): Prisma.MediaWhereInput => this.headquartersSelectiveWhere(roId, forJnv);
    const ownOrganization: Prisma.MediaWhereInput = {
      organizationId: actor.organizationId,
    };

    if (actor.role === Role.HEADQUARTER) return ownOrganization;
    if (actor.role === Role.NLI) {
      return { OR: [ownOrganization, headquartersShared] };
    }
    if (actor.role === Role.REGIONAL)
      return {
        OR: [
          ownOrganization,
          headquartersShared,
          headquartersSelectiveForRo(actor.organizationId),
        ],
      };
    if (actor.role === Role.JNV) {
      const organization = await this.prisma.organization.findFirst({
        where: { id: actor.organizationId, isDeleted: false },
        select: { parentOrganizationId: true },
      });
      const selective = organization?.parentOrganizationId
        ? [headquartersSelectiveForRo(organization.parentOrganizationId, true)]
        : [];
      return {
        OR: [
          ownOrganization,
          headquartersShared,
          ...selective,
          {
            visibleToAll: true,
            organization: {
              organizationType: { code: 'REGIONAL_OFFICE' },
              childOrganizations: { some: { id: actor.organizationId } },
            },
          },
        ],
      };
    }
    return ownOrganization;
  }

  private exactRoIdsWhere(roId: number): Prisma.MediaWhereInput {
    const token = String(roId);
    return {
      OR: [
        { roIds: token },
        { roIds: { startsWith: `${token},` } },
        { roIds: { endsWith: `,${token}` } },
        { roIds: { contains: `,${token},` } },
      ],
    };
  }

  private async publicWhere(
    query: Pick<GetPublicMediaQueryDto, 'organization_id' | 'media_type_id'>,
    importantLink?: ImportantLinkField,
  ): Promise<Prisma.MediaWhereInput> {
    const today = toCalendarDate(new Date().toISOString().slice(0, 10));
    const dateConditions: Prisma.MediaWhereInput[] = [
      { OR: [{ startDate: null }, { startDate: { lte: today } }] },
      { OR: [{ endDate: null }, { endDate: { gte: today } }] },
    ];
    const where: Prisma.MediaWhereInput = {
      isDeleted: false,
      isActive: true,
      ...(query.media_type_id ? { mediaTypeId: query.media_type_id } : {}),
      AND: dateConditions,
    };
    if (importantLink) dateConditions.push({ [importantLink]: true });
    if (query.organization_id === undefined) {
      dateConditions.push({
        visibleToAll: true,
        organization: { organizationType: { code: 'HEADQUARTER' } },
      });
      return where;
    }

    const organization = await this.prisma.organization.findFirst({
      where: { id: query.organization_id, isDeleted: false },
      select: {
        id: true,
        parentOrganizationId: true,
        organizationType: { select: { code: true } },
      },
    });
    if (!organization) throw new NotFoundException('Organization not found.');

    const own: Prisma.MediaWhereInput = { organizationId: organization.id };
    const headquartersShared: Prisma.MediaWhereInput = {
      visibleToAll: true,
      organization: { organizationType: { code: 'HEADQUARTER' } },
    };
    const publicVisibility: Prisma.MediaWhereInput[] = [
      own,
      headquartersShared,
    ];
    if (organization.organizationType.code === 'REGIONAL_OFFICE')
      publicVisibility.push(this.headquartersSelectiveWhere(organization.id));
    if (organization.organizationType.code === 'JNV') {
      if (organization.parentOrganizationId) {
        publicVisibility.push({
          visibleToAll: true,
          organizationId: organization.parentOrganizationId,
          organization: { organizationType: { code: 'REGIONAL_OFFICE' } },
        });
        publicVisibility.push(
          this.headquartersSelectiveWhere(
            organization.parentOrganizationId,
            true,
          ),
        );
      }
    }
    dateConditions.push({ OR: publicVisibility });
    return where;
  }

  private headquartersSelectiveWhere(
    roId: number,
    forJnv = false,
  ): Prisma.MediaWhereInput {
    return {
      visibleToAll: { not: true },
      ...(forJnv ? { visibleToJnv: true } : {}),
      organization: { organizationType: { code: 'HEADQUARTER' } },
      ...this.exactRoIdsWhere(roId),
    };
  }

  private orderBy(
    query: GetMediaQueryDto,
  ):
    | Prisma.MediaOrderByWithRelationInput
    | Prisma.MediaOrderByWithRelationInput[] {
    if (query.sort === 'display_order')
      return [{ display_order: query.order }, { id: 'asc' }];
    if (query.sort === 'is_active') return { isActive: query.order };
    return { [query.sort]: query.order };
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
      titleEnglish: media.titleEnglish,
      titleHindi: media.titleHindi,
      descriptionEnglish: media.descriptionEnglish,
      descriptionHindi: media.descriptionHindi,
      originalFilename: media.originalFilename,
      mimeType: media.mimeType,
      extension: media.extension,
      fileSize: media.fileSize.toString(),
      checksum: media.checksum,
      hindiOriginalFilename: media.hindiOriginalFilename,
      hindiMimeType: media.hindiMimeType,
      hindiExtension: media.hindiExtension,
      hindiFileSize: media.hindiFileSize?.toString() ?? null,
      hindiChecksum: media.hindiChecksum,
      hindiDownloadUrl: media.hindiFilePath
        ? `/api/media/${media.id}/download/hindi`
        : null,
      display_order: media.display_order,
      is_active: media.isActive,
      visible_to_all: media.visibleToAll,
      ro_ids: media.roIds,
      visible_to_jnv: media.visibleToJnv,
      important_link_1: media.importantLink1,
      important_link_2: media.importantLink2,
      important_link_3: media.importantLink3,
      start_date: formatCalendarDate(media.startDate),
      end_date: formatCalendarDate(media.endDate),
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
      titleEnglish: media.titleEnglish,
      titleHindi: media.titleHindi,
      descriptionEnglish: media.descriptionEnglish,
      descriptionHindi: media.descriptionHindi,
      originalFilename: media.originalFilename,
      storedFilename: media.storedFilename,
      filePath: media.filePath,
      mimeType: media.mimeType,
      extension: media.extension,
      fileSize: media.fileSize.toString(),
      checksum: media.checksum,
      hindiOriginalFilename: media.hindiOriginalFilename,
      hindiStoredFilename: media.hindiStoredFilename,
      hindiFilePath: media.hindiFilePath,
      hindiMimeType: media.hindiMimeType,
      hindiExtension: media.hindiExtension,
      hindiFileSize: media.hindiFileSize?.toString() ?? null,
      hindiChecksum: media.hindiChecksum,
      display_order: media.display_order,
      isActive: media.isActive,
      visibleToAll: media.visibleToAll,
      roIds: media.roIds,
      visibleToJnv: media.visibleToJnv,
      importantLink1: media.importantLink1,
      importantLink2: media.importantLink2,
      importantLink3: media.importantLink3,
      start_date: formatCalendarDate(media.startDate),
      end_date: formatCalendarDate(media.endDate),
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

  private toPublicResponse(
    media: Media,
    organizationId?: number,
  ): PublicMediaResponseDto {
    return {
      id: media.id,
      media_type_id: media.mediaTypeId,
      title_english: media.titleEnglish,
      title_hindi: media.titleHindi,
      description_english: media.descriptionEnglish,
      description_hindi: media.descriptionHindi,
      start_date: formatCalendarDate(media.startDate),
      end_date: formatCalendarDate(media.endDate),
      download_url: `/api/public/media/${media.id}/download${
        organizationId === undefined ? '' : `?organization_id=${organizationId}`
      }`,
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

  private async hindiFileData(file: Express.Multer.File) {
    return {
      hindiOriginalFilename: this.sanitizeFilename(file.originalname),
      hindiStoredFilename: file.filename,
      hindiFilePath: this.toStoredPath(file.path),
      hindiMimeType: file.mimetype,
      hindiExtension: this.extensionOf(file.originalname),
      hindiFileSize: BigInt(file.size),
      hindiChecksum: await this.checksum(file.path),
    };
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
