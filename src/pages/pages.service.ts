import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Page, PageStatus, Prisma, Role } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { OrganizationOwnershipService } from '../auth/services/organization-ownership.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import {
  formatCalendarDate,
  isInvalidDateRange,
  toCalendarDate,
} from '../common/utils/calendar-date.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { GetPagesQueryDto } from './dto/get-pages-query.dto';
import { GetPublicPagesQueryDto } from './dto/get-public-pages-query.dto';
import { PageResponseDto } from './dto/page-response.dto';
import { PublicPageResponseDto } from './dto/public-page-response.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: OrganizationOwnershipService,
  ) {}

  async create(
    dto: CreatePageDto,
    actor: AuthenticatedUser,
  ): Promise<PageResponseDto> {
    this.assertDateRange(dto.start_date, dto.end_date);
    this.ownership.assertAccess(dto.organizationId, actor);
    await this.ensureActiveOrganization(dto.organizationId);
    await this.ensureActiveContentType(dto.contentTypeId);
    await this.ensureOrganizationContentTypeIsAvailable(
      dto.organizationId,
      dto.contentTypeId,
    );

    const page = await this.prisma.$transaction(async (transaction) => {
      const status = dto.status ?? PageStatus.DRAFT;
      const createdPage = await transaction.page.create({
        data: {
          organizationId: dto.organizationId,
          contentTypeId: dto.contentTypeId,
          titleEnglish: dto.titleEnglish,
          titleHindi: dto.titleHindi,
          slug: await this.generateUniqueSlug(dto.titleEnglish, transaction),
          shortDescriptionEnglish: dto.shortDescriptionEnglish ?? null,
          shortDescriptionHindi: dto.shortDescriptionHindi ?? null,
          contentEnglish: dto.contentEnglish,
          contentHindi: dto.contentHindi,
          status,
          display_order: dto.display_order ?? 0,
          publishedAt: status === PageStatus.PUBLISHED ? new Date() : null,
          startDate: dto.start_date ? toCalendarDate(dto.start_date) : null,
          endDate: dto.end_date ? toCalendarDate(dto.end_date) : null,
          createdById: actor.id,
          updatedById: actor.id,
        },
      });
      await this.createAuditLog(transaction, actor.id, 'CREATE', createdPage);
      return createdPage;
    });

    return this.toResponse(page);
  }

  async findAll(
    query: GetPagesQueryDto,
    actor: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<PageResponseDto>> {
    if (query.organizationId)
      this.ownership.assertAccess(query.organizationId, actor);
    const where = this.buildWhere(query, actor);
    const orderBy: Prisma.PageOrderByWithRelationInput = {
      [query.sort]: query.order,
    };
    const [pages, totalItems] = await this.prisma.$transaction([
      this.prisma.page.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.page.count({ where }),
    ]);
    return {
      items: pages.map((page) => this.toResponse(page)),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async findOne(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<PageResponseDto> {
    const page = await this.findActivePage(id);
    this.ownership.assertAccess(page.organizationId, actor);
    return this.toResponse(page);
  }

  async findBySlug(
    slug: string,
    actor: AuthenticatedUser,
  ): Promise<PageResponseDto> {
    const page = await this.prisma.page.findFirst({
      where: { slug, isDeleted: false },
    });
    if (!page) throw new NotFoundException('Page not found.');
    this.ownership.assertAccess(page.organizationId, actor);
    return this.toResponse(page);
  }

  async findPublic(
    query: GetPublicPagesQueryDto,
  ): Promise<PaginatedResponseDto<PublicPageResponseDto>> {
    const where = this.publicWhere(query);
    const [pages, totalItems] = await this.prisma.$transaction([
      this.prisma.page.findMany({
        where,
        orderBy: [{ display_order: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.page.count({ where }),
    ]);
    return {
      items: pages.map((page) => this.toPublicResponse(page)),
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async findPublicBySlug(slug: string): Promise<PublicPageResponseDto> {
    const page = await this.prisma.page.findFirst({
      where: { slug, ...this.publicWhere({}) },
    });
    if (!page) throw new NotFoundException('Public page not found.');
    return this.toPublicResponse(page);
  }

  async update(
    id: number,
    dto: UpdatePageDto,
    actor: AuthenticatedUser,
  ): Promise<PageResponseDto> {
    const existingPage = await this.findActivePage(id);
    this.ownership.assertAccess(existingPage.organizationId, actor);
    const organizationId = dto.organizationId ?? existingPage.organizationId;
    const contentTypeId = dto.contentTypeId ?? existingPage.contentTypeId;
    this.assertDateRange(
      dto.start_date === undefined
        ? formatCalendarDate(existingPage.startDate)
        : dto.start_date,
      dto.end_date === undefined
        ? formatCalendarDate(existingPage.endDate)
        : dto.end_date,
    );
    this.ownership.assertAccess(organizationId, actor);
    await this.ensureActiveOrganization(organizationId);
    await this.ensureActiveContentType(contentTypeId);
    if (
      organizationId !== existingPage.organizationId ||
      contentTypeId !== existingPage.contentTypeId
    ) {
      await this.ensureOrganizationContentTypeIsAvailable(
        organizationId,
        contentTypeId,
        id,
      );
    }

    const page = await this.prisma.$transaction(async (transaction) => {
      const updatedPage = await transaction.page.update({
        where: { id },
        data: {
          organizationId,
          contentTypeId,
          ...(dto.titleEnglish
            ? {
                titleEnglish: dto.titleEnglish,
                slug: await this.generateUniqueSlug(
                  dto.titleEnglish,
                  transaction,
                  id,
                ),
              }
            : {}),
          ...(dto.titleHindi !== undefined
            ? { titleHindi: dto.titleHindi }
            : {}),
          ...(dto.shortDescriptionEnglish !== undefined
            ? { shortDescriptionEnglish: dto.shortDescriptionEnglish }
            : {}),
          ...(dto.shortDescriptionHindi !== undefined
            ? { shortDescriptionHindi: dto.shortDescriptionHindi }
            : {}),
          ...(dto.contentEnglish !== undefined
            ? { contentEnglish: dto.contentEnglish }
            : {}),
          ...(dto.contentHindi !== undefined
            ? { contentHindi: dto.contentHindi }
            : {}),
          ...(dto.display_order !== undefined
            ? { display_order: dto.display_order }
            : {}),
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
        updatedPage,
        existingPage,
      );
      return updatedPage;
    });
    return this.toResponse(page);
  }

  async publish(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<PageResponseDto> {
    return this.updatePublication(id, PageStatus.PUBLISHED, 'PUBLISH', actor);
  }

  async unpublish(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<PageResponseDto> {
    return this.updatePublication(id, PageStatus.DRAFT, 'UNPUBLISH', actor);
  }

  async remove(id: number, actor: AuthenticatedUser): Promise<PageResponseDto> {
    const page = await this.prisma.$transaction(async (transaction) => {
      const existingPage = await transaction.page.findFirst({
        where: { id, isDeleted: false },
      });
      if (!existingPage)
        throw new NotFoundException(
          'Page not found or has already been deleted.',
        );
      this.ownership.assertAccess(existingPage.organizationId, actor);
      const deletedPage = await transaction.page.update({
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
        deletedPage,
        existingPage,
      );
      return deletedPage;
    });
    return this.toResponse(page);
  }

  async restore(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<PageResponseDto> {
    const page = await this.prisma.$transaction(async (transaction) => {
      const existingPage = await transaction.page.findFirst({
        where: { id, isDeleted: true },
      });
      if (!existingPage) throw new NotFoundException('Deleted page not found.');
      this.ownership.assertAccess(existingPage.organizationId, actor);
      await this.ensureActiveOrganization(existingPage.organizationId);
      await this.ensureActiveContentType(existingPage.contentTypeId);
      const restoredPage = await transaction.page.update({
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
        restoredPage,
        existingPage,
      );
      return restoredPage;
    });
    return this.toResponse(page);
  }

  private async updatePublication(
    id: number,
    status: PageStatus,
    action: 'PUBLISH' | 'UNPUBLISH',
    actor: AuthenticatedUser,
  ): Promise<PageResponseDto> {
    const page = await this.prisma.$transaction(async (transaction) => {
      const existingPage = await transaction.page.findFirst({
        where: { id, isDeleted: false },
      });
      if (!existingPage)
        throw new NotFoundException('Page not found or has been deleted.');
      this.ownership.assertAccess(existingPage.organizationId, actor);
      const updatedPage = await transaction.page.update({
        where: { id },
        data: {
          status,
          publishedAt: status === PageStatus.PUBLISHED ? new Date() : null,
          updatedById: actor.id,
        },
      });
      await this.createAuditLog(
        transaction,
        actor.id,
        action,
        updatedPage,
        existingPage,
      );
      return updatedPage;
    });
    return this.toResponse(page);
  }

  private async findActivePage(id: number): Promise<Page> {
    const page = await this.prisma.page.findFirst({
      where: { id, isDeleted: false },
    });
    if (!page)
      throw new NotFoundException('Page not found or has been deleted.');
    return page;
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

  private async ensureActiveContentType(id: number): Promise<void> {
    const contentType = await this.prisma.contentType.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });
    if (!contentType)
      throw new NotFoundException(
        'Content type not found or has been deleted.',
      );
  }

  private async ensureOrganizationContentTypeIsAvailable(
    organizationId: number,
    contentTypeId: number,
    excludedId?: number,
  ): Promise<void> {
    const duplicate = await this.prisma.page.findFirst({
      where: {
        organizationId,
        contentTypeId,
        ...(excludedId ? { id: { not: excludedId } } : {}),
      },
      select: { id: true },
    });
    if (duplicate)
      throw new ConflictException(
        'An organization can only have one page for each content type.',
      );
  }

  private buildWhere(
    query: GetPagesQueryDto,
    actor: AuthenticatedUser,
  ): Prisma.PageWhereInput {
    const where: Prisma.PageWhereInput = {
      isDeleted: query.isDeleted ?? false,
      ...(query.contentTypeId ? { contentTypeId: query.contentTypeId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(actor.role === Role.SUPER_ADMIN
        ? query.organizationId
          ? { organizationId: query.organizationId }
          : {}
        : { organizationId: actor.organizationId }),
    };
    if (query.search?.trim()) {
      where.OR = [
        {
          titleEnglish: { contains: query.search.trim(), mode: 'insensitive' },
        },
        { titleHindi: { contains: query.search.trim(), mode: 'insensitive' } },
        { slug: { contains: query.search.trim(), mode: 'insensitive' } },
        {
          shortDescriptionEnglish: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
        {
          shortDescriptionHindi: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
        {
          contentEnglish: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
        {
          contentHindi: { contains: query.search.trim(), mode: 'insensitive' },
        },
      ];
    }
    return where;
  }

  private publicWhere(
    query: Pick<GetPublicPagesQueryDto, 'organization_id' | 'content_type_id'>,
  ): Prisma.PageWhereInput {
    const today = toCalendarDate(new Date().toISOString().slice(0, 10));
    return {
      isDeleted: false,
      status: PageStatus.PUBLISHED,
      ...(query.organization_id
        ? { organizationId: query.organization_id }
        : {}),
      ...(query.content_type_id
        ? { contentTypeId: query.content_type_id }
        : {}),
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: today } }] },
        { OR: [{ endDate: null }, { endDate: { gte: today } }] },
      ],
    };
  }

  private assertDateRange(
    startDate?: string | null,
    endDate?: string | null,
  ): void {
    if (isInvalidDateRange(startDate, endDate))
      throw new ConflictException(
        'End date must not be earlier than start date.',
      );
  }

  private async generateUniqueSlug(
    title: string,
    transaction: Prisma.TransactionClient,
    excludedId?: number,
  ): Promise<string> {
    const baseSlug = this.slugify(title) || 'page';
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      const duplicate = await transaction.page.findFirst({
        where: { slug, ...(excludedId ? { id: { not: excludedId } } : {}) },
        select: { id: true },
      });
      if (!duplicate) return slug;

      const suffixValue = `-${suffix++}`;
      slug = `${baseSlug.slice(0, 255 - suffixValue.length)}${suffixValue}`;
    }
  }

  private slugify(value: string): string {
    return value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 255);
  }

  private async createAuditLog(
    transaction: Prisma.TransactionClient,
    userId: number,
    action: string,
    newPage: Page,
    previousPage?: Page,
  ): Promise<void> {
    await transaction.auditLog.create({
      data: {
        userId,
        module: 'PAGE',
        entity: 'PAGE',
        entityId: newPage.id,
        action,
        ...(previousPage
          ? { previousValues: this.toAuditValues(previousPage) }
          : {}),
        newValues: this.toAuditValues(newPage),
      },
    });
  }

  private toResponse(page: Page): PageResponseDto {
    return {
      id: page.id,
      organizationId: page.organizationId,
      contentTypeId: page.contentTypeId,
      titleEnglish: page.titleEnglish,
      titleHindi: page.titleHindi,
      slug: page.slug,
      shortDescriptionEnglish: page.shortDescriptionEnglish,
      shortDescriptionHindi: page.shortDescriptionHindi,
      contentEnglish: page.contentEnglish,
      contentHindi: page.contentHindi,
      status: page.status,
      display_order: page.display_order,
      publishedAt: page.publishedAt,
      start_date: formatCalendarDate(page.startDate),
      end_date: formatCalendarDate(page.endDate),
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };
  }

  private toPublicResponse(page: Page): PublicPageResponseDto {
    return {
      id: page.id,
      content_type_id: page.contentTypeId,
      title_english: page.titleEnglish,
      title_hindi: page.titleHindi,
      slug: page.slug,
      short_description_english: page.shortDescriptionEnglish,
      short_description_hindi: page.shortDescriptionHindi,
      content_english: page.contentEnglish,
      content_hindi: page.contentHindi,
      display_order: page.display_order,
      start_date: formatCalendarDate(page.startDate),
      end_date: formatCalendarDate(page.endDate),
    };
  }

  private toAuditValues(page: Page): Prisma.InputJsonValue {
    return {
      id: page.id,
      organizationId: page.organizationId,
      contentTypeId: page.contentTypeId,
      titleEnglish: page.titleEnglish,
      titleHindi: page.titleHindi,
      slug: page.slug,
      shortDescriptionEnglish: page.shortDescriptionEnglish,
      shortDescriptionHindi: page.shortDescriptionHindi,
      contentEnglish: page.contentEnglish,
      contentHindi: page.contentHindi,
      status: page.status,
      display_order: page.display_order,
      publishedAt: page.publishedAt?.toISOString() ?? null,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
      createdById: page.createdById,
      updatedById: page.updatedById,
      isDeleted: page.isDeleted,
      deletedAt: page.deletedAt?.toISOString() ?? null,
      deletedById: page.deletedById,
    };
  }
}
