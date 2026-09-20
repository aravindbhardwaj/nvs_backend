import { getAuditRequestContext } from '../common/request-context/audit-request-context';
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
import { resolveRelatedId } from '../common/utils/resolve-related-id.util';
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

  async resolveUuid(uuid: string): Promise<number> {
    // Resolve deleted records too; existing operations enforce visibility and state.
    const record = await this.prisma.page.findUnique({
      where: { uuid },
      select: { id: true },
    });
    if (!record) throw new NotFoundException('Record not found.');
    return record.id;
  }

  async create(
    dto: CreatePageDto,
    actor: AuthenticatedUser,
  ): Promise<PageResponseDto> {
    const organizationId = (await resolveRelatedId(
      dto.organizationId,
      dto.organizationUuid,
      'Organization',
      (uuid) =>
        this.prisma.organization.findUnique({
          where: { uuid },
          select: { id: true },
        }),
    ))!;
    const contentTypeId = (await resolveRelatedId(
      dto.contentTypeId,
      dto.contentTypeUuid,
      'Content type',
      (uuid) =>
        this.prisma.contentType.findUnique({
          where: { uuid },
          select: { id: true },
        }),
    ))!;
    this.assertDateRange(dto.start_date, dto.end_date);
    this.ownership.assertAccess(organizationId, actor);
    await this.ensureActiveOrganization(organizationId);
    await this.ensureActiveContentType(contentTypeId);
    await this.ensureOrganizationContentTypeIsAvailable(
      organizationId,
      contentTypeId,
    );

    const page = await this.prisma.$transaction(async (transaction) => {
      const status = dto.status ?? PageStatus.DRAFT;
      const createdPage = await transaction.page.create({
        data: {
          organizationId,
          contentTypeId,
          titleEnglish: dto.titleEnglish,
          titleHindi: dto.titleHindi,
          slug: await this.generateUniqueSlug(dto.titleEnglish, transaction),
          shortDescriptionEnglish: dto.shortDescriptionEnglish ?? null,
          shortDescriptionHindi: dto.shortDescriptionHindi ?? null,
          contentEnglish: dto.contentEnglish,
          contentHindi: dto.contentHindi,
          section1LabelEn: dto.section1_label_en,
          section1LabelHi: dto.section1_label_hi,
          section2LabelEn: dto.section2_label_en,
          section2LabelHi: dto.section2_label_hi,
          content2English: dto.content2_english,
          content2Hindi: dto.content2_hindi,
          section3LabelEn: dto.section3_label_en,
          section3LabelHi: dto.section3_label_hi,
          content3English: dto.content3_english,
          content3Hindi: dto.content3_hindi,
          section4LabelEn: dto.section4_label_en,
          section4LabelHi: dto.section4_label_hi,
          content4English: dto.content4_english,
          content4Hindi: dto.content4_hindi,
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
  ): Promise<
    PaginatedResponseDto<PageResponseDto & { organization_name: string }>
  > {
    query.organizationId = await this.resolveOrganizationId(
      query.organizationId,
      query.organizationUuid,
    );
    query.contentTypeId = await this.resolveContentTypeId(
      query.contentTypeId,
      query.contentTypeUuid,
    );
    if (query.organizationId)
      this.ownership.assertAccess(query.organizationId, actor);
    const where = this.buildWhere(query, actor);
    const orderBy:
      | Prisma.PageOrderByWithRelationInput
      | Prisma.PageOrderByWithRelationInput[] =
      query.sort === 'display_order'
        ? [
            { display_order: query.order },
            { createdAt: 'desc' },
            { id: 'desc' },
          ]
        : { [query.sort]: query.order };
    const [pages, totalItems] = await this.prisma.$transaction([
      this.prisma.page.findMany({
        include: { organization: { select: { organizationName: true } } },
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.page.count({ where }),
    ]);
    return {
      items: pages.map((page) => ({
        ...this.toResponse(page),
        organization_name: page.organization.organizationName,
      })),
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
    query.organization_id = await this.resolveOrganizationId(
      query.organization_id,
      query.organization_uuid,
    );
    query.content_type_id = await this.resolveContentTypeId(
      query.content_type_id,
      query.content_type_uuid,
    );
    const where = this.publicWhere(query);
    const [pages, totalItems] = await this.prisma.$transaction([
      this.prisma.page.findMany({
        where,
        orderBy: [
          { display_order: 'asc' },
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
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
    const organizationId =
      (await this.resolveOrganizationId(
        dto.organizationId,
        dto.organizationUuid,
      )) ?? existingPage.organizationId;
    const contentTypeId =
      (await this.resolveContentTypeId(
        dto.contentTypeId,
        dto.contentTypeUuid,
      )) ?? existingPage.contentTypeId;
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
          ...(dto.section1_label_en !== undefined
            ? { section1LabelEn: dto.section1_label_en }
            : {}),
          ...(dto.section1_label_hi !== undefined
            ? { section1LabelHi: dto.section1_label_hi }
            : {}),
          ...(dto.section2_label_en !== undefined
            ? { section2LabelEn: dto.section2_label_en }
            : {}),
          ...(dto.section2_label_hi !== undefined
            ? { section2LabelHi: dto.section2_label_hi }
            : {}),
          ...(dto.content2_english !== undefined
            ? { content2English: dto.content2_english }
            : {}),
          ...(dto.content2_hindi !== undefined
            ? { content2Hindi: dto.content2_hindi }
            : {}),
          ...(dto.section3_label_en !== undefined
            ? { section3LabelEn: dto.section3_label_en }
            : {}),
          ...(dto.section3_label_hi !== undefined
            ? { section3LabelHi: dto.section3_label_hi }
            : {}),
          ...(dto.content3_english !== undefined
            ? { content3English: dto.content3_english }
            : {}),
          ...(dto.content3_hindi !== undefined
            ? { content3Hindi: dto.content3_hindi }
            : {}),
          ...(dto.section4_label_en !== undefined
            ? { section4LabelEn: dto.section4_label_en }
            : {}),
          ...(dto.section4_label_hi !== undefined
            ? { section4LabelHi: dto.section4_label_hi }
            : {}),
          ...(dto.content4_english !== undefined
            ? { content4English: dto.content4_english }
            : {}),
          ...(dto.content4_hindi !== undefined
            ? { content4Hindi: dto.content4_hindi }
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

  private resolveOrganizationId(id?: number, uuid?: string) {
    return resolveRelatedId(id, uuid, 'Organization', (value) =>
      this.prisma.organization.findUnique({
        where: { uuid: value },
        select: { id: true },
      }),
    );
  }

  private resolveContentTypeId(id?: number, uuid?: string) {
    return resolveRelatedId(id, uuid, 'Content type', (value) =>
      this.prisma.contentType.findUnique({
        where: { uuid: value },
        select: { id: true },
      }),
    );
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
        ...getAuditRequestContext(),
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
      uuid: page.uuid,
      organizationId: page.organizationId,
      contentTypeId: page.contentTypeId,
      titleEnglish: page.titleEnglish,
      titleHindi: page.titleHindi,
      slug: page.slug,
      shortDescriptionEnglish: page.shortDescriptionEnglish,
      shortDescriptionHindi: page.shortDescriptionHindi,
      contentEnglish: page.contentEnglish,
      contentHindi: page.contentHindi,
      section1_label_en: page.section1LabelEn,
      section1_label_hi: page.section1LabelHi,
      section2_label_en: page.section2LabelEn,
      section2_label_hi: page.section2LabelHi,
      content2_english: page.content2English,
      content2_hindi: page.content2Hindi,
      section3_label_en: page.section3LabelEn,
      section3_label_hi: page.section3LabelHi,
      content3_english: page.content3English,
      content3_hindi: page.content3Hindi,
      section4_label_en: page.section4LabelEn,
      section4_label_hi: page.section4LabelHi,
      content4_english: page.content4English,
      content4_hindi: page.content4Hindi,
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
      uuid: page.uuid,
      content_type_id: page.contentTypeId,
      title_english: page.titleEnglish,
      title_hindi: page.titleHindi,
      slug: page.slug,
      short_description_english: page.shortDescriptionEnglish,
      short_description_hindi: page.shortDescriptionHindi,
      content_english: page.contentEnglish,
      content_hindi: page.contentHindi,
      section1_label_en: page.section1LabelEn,
      section1_label_hi: page.section1LabelHi,
      section2_label_en: page.section2LabelEn,
      section2_label_hi: page.section2LabelHi,
      content2_english: page.content2English,
      content2_hindi: page.content2Hindi,
      section3_label_en: page.section3LabelEn,
      section3_label_hi: page.section3LabelHi,
      content3_english: page.content3English,
      content3_hindi: page.content3Hindi,
      section4_label_en: page.section4LabelEn,
      section4_label_hi: page.section4LabelHi,
      content4_english: page.content4English,
      content4_hindi: page.content4Hindi,
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
      section1_label_en: page.section1LabelEn,
      section1_label_hi: page.section1LabelHi,
      section2_label_en: page.section2LabelEn,
      section2_label_hi: page.section2LabelHi,
      content2_english: page.content2English,
      content2_hindi: page.content2Hindi,
      section3_label_en: page.section3LabelEn,
      section3_label_hi: page.section3LabelHi,
      content3_english: page.content3English,
      content3_hindi: page.content3Hindi,
      section4_label_en: page.section4LabelEn,
      section4_label_hi: page.section4LabelHi,
      content4_english: page.content4English,
      content4_hindi: page.content4Hindi,
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
