import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Banner, Prisma, Role } from '@prisma/client';
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
import { BANNER_UPLOADS_ROOT, validateBannerImage } from './banner.storage';
import {
  BannerResponseDto,
  PublicBannerResponseDto,
} from './dto/banner-response.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { GetBannersQueryDto } from './dto/get-banners-query.dto';
import { GetPublicBannersQueryDto } from './dto/get-public-banners-query.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: OrganizationOwnershipService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    dto: CreateBannerDto,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ): Promise<BannerResponseDto> {
    await validateBannerImage(file);
    this.assertDisplayDates(dto.start_date, dto.end_date);
    const organizationId = dto.organizationId ?? actor.organizationId;
    this.ownership.assertAccess(organizationId, actor);
    await this.ensureActiveOrganization(organizationId);
    const banner = await this.prisma.$transaction(async (transaction) => {
      if (dto.isActive ?? true)
        await this.assertBannerUploadLimit(transaction, organizationId);
      const createdBanner = await transaction.banner.create({
        data: {
          organizationId,
          titleEnglish: dto.titleEnglish,
          titleHindi: dto.titleHindi,
          descriptionEnglish: dto.descriptionEnglish ?? null,
          descriptionHindi: dto.descriptionHindi ?? null,
          altTextEnglish: dto.altTextEnglish ?? null,
          altTextHindi: dto.altTextHindi ?? null,
          storedFilename: file.filename,
          imagePath: this.toStoredPath(file.path),
          mimeType: file.mimetype,
          extension: this.extensionOf(file.originalname),
          fileSize: BigInt(file.size),
          display_order: dto.display_order ?? 0,
          isActive: dto.isActive ?? true,
          visibleToAll: dto.visible_to_all ?? null,
          startDate: dto.start_date ? toCalendarDate(dto.start_date) : null,
          endDate: dto.end_date ? toCalendarDate(dto.end_date) : null,
          createdById: actor.id,
          updatedById: actor.id,
        },
      });
      await this.createAuditLog(transaction, actor.id, 'CREATE', createdBanner);
      return createdBanner;
    });
    return this.toResponse(banner);
  }

  async findAll(
    query: GetBannersQueryDto,
    actor: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<BannerResponseDto>> {
    if (query.organizationId)
      this.ownership.assertAccess(query.organizationId, actor);
    const where = this.buildWhere(query, actor);
    const orderBy:
      | Prisma.BannerOrderByWithRelationInput
      | Prisma.BannerOrderByWithRelationInput[] =
      query.sort === 'display_order'
        ? [
            { display_order: query.order },
            { createdAt: 'desc' },
            { id: 'desc' },
          ]
        : { [query.sort]: query.order };
    const [banners, totalItems] = await this.prisma.$transaction([
      this.prisma.banner.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.banner.count({ where }),
    ]);
    return {
      items: banners.map((banner) => this.toResponse(banner)),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async findOne(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<BannerResponseDto> {
    const banner = await this.findViewableBanner(id, actor);
    return this.toResponse(banner);
  }

  async update(
    id: number,
    dto: UpdateBannerDto,
    actor: AuthenticatedUser,
  ): Promise<BannerResponseDto> {
    const existing = await this.findActiveBanner(id);
    this.ownership.assertAccess(existing.organizationId, actor);
    this.assertDisplayDates(
      dto.start_date === undefined
        ? formatCalendarDate(existing.startDate)
        : dto.start_date,
      dto.end_date === undefined
        ? formatCalendarDate(existing.endDate)
        : dto.end_date,
    );
    const banner = await this.prisma.$transaction(async (transaction) => {
      const updatedBanner = await transaction.banner.update({
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
          ...(dto.visible_to_all === undefined
            ? {}
            : { visibleToAll: dto.visible_to_all }),
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
        updatedBanner,
        existing,
      );
      return updatedBanner;
    });
    return this.toResponse(banner);
  }

  async replaceImage(
    id: number,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ): Promise<BannerResponseDto> {
    await validateBannerImage(file);
    const existing = await this.findActiveBanner(id);
    this.ownership.assertAccess(existing.organizationId, actor);
    const replacementData = {
      storedFilename: file.filename,
      imagePath: this.toStoredPath(file.path),
      mimeType: file.mimetype,
      extension: this.extensionOf(file.originalname),
      fileSize: BigInt(file.size),
      updatedById: actor.id,
    };
    const banner = await this.prisma.$transaction(async (transaction) => {
      const updatedBanner = await transaction.banner.update({
        where: { id },
        data: replacementData,
      });
      await this.createAuditLog(
        transaction,
        actor.id,
        'REPLACE_IMAGE',
        updatedBanner,
        existing,
      );
      return updatedBanner;
    });
    try {
      await this.removePhysicalFile(existing.imagePath);
    } catch {
      await this.prisma.banner.update({
        where: { id },
        data: {
          storedFilename: existing.storedFilename,
          imagePath: existing.imagePath,
          mimeType: existing.mimeType,
          extension: existing.extension,
          fileSize: existing.fileSize,
          updatedById: existing.updatedById,
        },
      });
      await this.removePhysicalFile(replacementData.imagePath).catch(
        () => undefined,
      );
      throw new InternalServerErrorException(
        'Unable to replace the existing banner image.',
      );
    }
    return this.toResponse(banner);
  }

  async setActive(
    id: number,
    isActive: boolean,
    actor: AuthenticatedUser,
  ): Promise<BannerResponseDto> {
    const existing = await this.findActiveBanner(id);
    this.ownership.assertAccess(existing.organizationId, actor);
    const banner = await this.prisma.$transaction(async (transaction) => {
      if (isActive && !existing.isActive)
        await this.assertBannerUploadLimit(
          transaction,
          existing.organizationId,
        );
      const updatedBanner = await transaction.banner.update({
        where: { id },
        data: { isActive, updatedById: actor.id },
      });
      await this.createAuditLog(
        transaction,
        actor.id,
        isActive ? 'ACTIVATE' : 'DEACTIVATE',
        updatedBanner,
        existing,
      );
      return updatedBanner;
    });
    return this.toResponse(banner);
  }

  async remove(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<BannerResponseDto> {
    const banner = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.banner.findFirst({
        where: { id, isDeleted: false },
      });
      if (!existing)
        throw new NotFoundException(
          'Banner not found or has already been deleted.',
        );
      this.ownership.assertAccess(existing.organizationId, actor);
      const deletedBanner = await transaction.banner.update({
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
        deletedBanner,
        existing,
      );
      return deletedBanner;
    });
    return this.toResponse(banner);
  }

  async restore(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<BannerResponseDto> {
    const banner = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.banner.findFirst({
        where: { id, isDeleted: true },
      });
      if (!existing) throw new NotFoundException('Deleted banner not found.');
      this.ownership.assertAccess(existing.organizationId, actor);
      if (existing.isActive)
        await this.assertBannerUploadLimit(
          transaction,
          existing.organizationId,
        );
      const restoredBanner = await transaction.banner.update({
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
        restoredBanner,
        existing,
      );
      return restoredBanner;
    });
    return this.toResponse(banner);
  }

  async findDisplayable(
    query: GetPublicBannersQueryDto,
  ): Promise<PaginatedResponseDto<PublicBannerResponseDto>> {
    const where = await this.publicDisplayableWhere(query.organization_id);
    const [banners, totalItems] = await this.prisma.$transaction([
      this.prisma.banner.findMany({
        where,
        orderBy: [
          { display_order: 'asc' },
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.banner.count({ where }),
    ]);
    return {
      items: banners.map((banner) =>
        this.toPublicResponse(banner, query.organization_id),
      ),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async imageStream(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<{
    stream: ReturnType<typeof createReadStream>;
    mimeType: string;
  }> {
    const banner = await this.findViewableBanner(id, actor);
    return this.openImage(banner);
  }

  async publicImageStream(
    id: number,
    organizationId?: number,
  ): Promise<{
    stream: ReturnType<typeof createReadStream>;
    mimeType: string;
  }> {
    const banner = await this.prisma.banner.findFirst({
      where: { id, ...(await this.publicDisplayableWhere(organizationId)) },
    });
    if (!banner) throw new NotFoundException('Displayable banner not found.');
    return this.openImage(banner);
  }

  async cleanupUploadedFile(file?: Express.Multer.File): Promise<void> {
    if (file) await unlink(file.path).catch(() => undefined);
  }

  private async openImage(banner: Banner): Promise<{
    stream: ReturnType<typeof createReadStream>;
    mimeType: string;
  }> {
    const imagePath = this.absolutePath(banner.imagePath);
    try {
      await access(imagePath);
    } catch {
      throw new NotFoundException('The banner image is no longer available.');
    }
    return { stream: createReadStream(imagePath), mimeType: banner.mimeType };
  }

  private async findActiveBanner(id: number): Promise<Banner> {
    const banner = await this.prisma.banner.findFirst({
      where: { id, isDeleted: false },
    });
    if (!banner)
      throw new NotFoundException('Banner not found or has been deleted.');
    return banner;
  }

  private async findViewableBanner(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<Banner> {
    const visibilityWhere = this.visibilityWhere({}, actor);
    const banner = await this.prisma.banner.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(visibilityWhere ? { AND: [visibilityWhere] } : {}),
      },
    });
    if (!banner)
      throw new NotFoundException('Banner not found or has been deleted.');
    return banner;
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

  private buildWhere(
    query: GetBannersQueryDto,
    actor: AuthenticatedUser,
  ): Prisma.BannerWhereInput {
    const where: Prisma.BannerWhereInput = {
      isDeleted: query.isDeleted ?? false,
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
    };
    const visibilityWhere = this.visibilityWhere(query, actor);
    if (visibilityWhere) where.AND = [visibilityWhere];
    if (query.search?.trim()) {
      const searchWhere: Prisma.BannerWhereInput = {
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
            altTextEnglish: {
              contains: query.search.trim(),
              mode: 'insensitive',
            },
          },
          {
            altTextHindi: {
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

  private visibilityWhere(
    query: Pick<GetBannersQueryDto, 'organizationId'>,
    actor: AuthenticatedUser,
  ): Prisma.BannerWhereInput | undefined {
    if (actor.role === Role.SUPER_ADMIN) {
      return query.organizationId
        ? { organizationId: query.organizationId }
        : undefined;
    }

    if (query.organizationId) return { organizationId: actor.organizationId };

    const headquartersShared: Prisma.BannerWhereInput = {
      visibleToAll: true,
      organization: { organizationType: { code: 'HEADQUARTER' } },
    };
    const ownOrganization: Prisma.BannerWhereInput = {
      organizationId: actor.organizationId,
    };

    if (actor.role === Role.HEADQUARTER) return ownOrganization;
    if (actor.role === Role.NLI || actor.role === Role.REGIONAL) {
      return { OR: [ownOrganization, headquartersShared] };
    }
    if (actor.role === Role.JNV) {
      return {
        OR: [
          ownOrganization,
          headquartersShared,
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

  private async assertBannerUploadLimit(
    transaction: Prisma.TransactionClient,
    organizationId: number,
  ): Promise<void> {
    const limit = this.maxBannersPerOrganization();
    const count = await transaction.banner.count({
      where: { organizationId, isDeleted: false, isActive: true },
    });
    if (count >= limit) {
      throw new BadRequestException(
        'Banner limit reached. Please deactivate, delete, or replace an existing banner to continue.',
      );
    }
  }

  private maxBannersPerOrganization(): number {
    const configured = this.configService.get<number>(
      'banner.maxBannersPerOrganization',
      5,
    );
    return Number.isSafeInteger(configured) && configured > 0 ? configured : 5;
  }

  private displayableWhere(organizationId?: number): Prisma.BannerWhereInput {
    const now = new Date();
    return {
      isDeleted: false,
      isActive: true,
      ...(organizationId ? { organizationId } : {}),
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    };
  }

  private async publicDisplayableWhere(
    organizationId?: number,
  ): Promise<Prisma.BannerWhereInput> {
    if (
      organizationId !== undefined &&
      (!Number.isSafeInteger(organizationId) || organizationId < 1)
    )
      throw new BadRequestException(
        'organization_id must be a positive integer.',
      );
    const base = this.displayableWhere();
    const dateConditions: Prisma.BannerWhereInput[] = base.AND
      ? Array.isArray(base.AND)
        ? base.AND
        : [base.AND]
      : [];
    if (organizationId === undefined)
      return {
        ...base,
        AND: [...dateConditions, { visibleToAll: true }],
      };

    const organization = await this.prisma.organization.findFirst({
      where: { id: organizationId, isDeleted: false },
      select: {
        id: true,
        parentOrganizationId: true,
        organizationType: { select: { code: true } },
      },
    });
    if (!organization) throw new NotFoundException('Organization not found.');

    const sharedFromHeadquarters: Prisma.BannerWhereInput = {
      visibleToAll: true,
      organization: { organizationType: { code: 'HEADQUARTER' } },
    };
    const visibleToOrganization: Prisma.BannerWhereInput[] = [
      { organizationId: organization.id },
      sharedFromHeadquarters,
    ];
    if (
      organization.organizationType.code === 'JNV' &&
      organization.parentOrganizationId
    ) {
      visibleToOrganization.push({
        visibleToAll: true,
        organizationId: organization.parentOrganizationId,
        organization: { organizationType: { code: 'REGIONAL_OFFICE' } },
      });
    }
    return {
      ...base,
      AND: [...dateConditions, { OR: visibleToOrganization }],
    };
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

  private async createAuditLog(
    transaction: Prisma.TransactionClient,
    userId: number,
    action: string,
    banner: Banner,
    previousBanner?: Banner,
  ): Promise<void> {
    await transaction.auditLog.create({
      data: {
        userId,
        module: 'BANNER',
        entity: 'BANNER',
        entityId: banner.id,
        action,
        ...(previousBanner
          ? { previousValues: this.toAuditValues(previousBanner) }
          : {}),
        newValues: this.toAuditValues(banner),
      },
    });
  }

  private toResponse(banner: Banner): BannerResponseDto {
    return {
      id: banner.id,
      organizationId: banner.organizationId,
      titleEnglish: banner.titleEnglish,
      titleHindi: banner.titleHindi,
      descriptionEnglish: banner.descriptionEnglish,
      descriptionHindi: banner.descriptionHindi,
      altTextEnglish: banner.altTextEnglish,
      altTextHindi: banner.altTextHindi,
      imageUrl: `/api/banners/${banner.id}/image`,
      mimeType: banner.mimeType,
      extension: banner.extension,
      fileSize: banner.fileSize.toString(),
      display_order: banner.display_order,
      isActive: banner.isActive,
      visible_to_all: banner.visibleToAll,
      start_date: formatCalendarDate(banner.startDate),
      end_date: formatCalendarDate(banner.endDate),
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
      isDeleted: banner.isDeleted,
    };
  }

  private toPublicResponse(
    banner: Banner,
    organizationId?: number,
  ): PublicBannerResponseDto {
    return {
      id: banner.id,
      title_english: banner.titleEnglish,
      title_hindi: banner.titleHindi,
      description_english: banner.descriptionEnglish,
      description_hindi: banner.descriptionHindi,
      alt_text_english: banner.altTextEnglish,
      alt_text_hindi: banner.altTextHindi,
      image_url: `/api/public/banners/${banner.id}/image${
        organizationId ? `?organization_id=${organizationId}` : ''
      }`,
      display_order: banner.display_order,
      start_date: formatCalendarDate(banner.startDate),
      end_date: formatCalendarDate(banner.endDate),
    };
  }

  private toAuditValues(banner: Banner): Prisma.InputJsonValue {
    return {
      id: banner.id,
      organizationId: banner.organizationId,
      titleEnglish: banner.titleEnglish,
      titleHindi: banner.titleHindi,
      descriptionEnglish: banner.descriptionEnglish,
      descriptionHindi: banner.descriptionHindi,
      altTextEnglish: banner.altTextEnglish,
      altTextHindi: banner.altTextHindi,
      storedFilename: banner.storedFilename,
      imagePath: banner.imagePath,
      mimeType: banner.mimeType,
      extension: banner.extension,
      fileSize: banner.fileSize.toString(),
      display_order: banner.display_order,
      isActive: banner.isActive,
      visibleToAll: banner.visibleToAll,
      startDate: banner.startDate?.toISOString() ?? null,
      endDate: banner.endDate?.toISOString() ?? null,
      isDeleted: banner.isDeleted,
      deletedAt: banner.deletedAt?.toISOString() ?? null,
    };
  }

  private extensionOf(filename: string): string {
    return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
  }

  private toStoredPath(filePath: string): string {
    return relative(process.cwd(), filePath);
  }

  private absolutePath(filePath: string): string {
    const absolutePath = resolve(process.cwd(), filePath);
    if (!absolutePath.startsWith(`${BANNER_UPLOADS_ROOT}/`)) {
      throw new NotFoundException('Banner image not found.');
    }
    return absolutePath;
  }

  private async removePhysicalFile(filePath: string): Promise<void> {
    await unlink(this.absolutePath(filePath));
  }
}
