"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const organization_ownership_service_1 = require("../auth/services/organization-ownership.service");
const pagination_util_1 = require("../common/utils/pagination.util");
const calendar_date_util_1 = require("../common/utils/calendar-date.util");
const prisma_service_1 = require("../prisma/prisma.service");
let PagesService = class PagesService {
    prisma;
    ownership;
    constructor(prisma, ownership) {
        this.prisma = prisma;
        this.ownership = ownership;
    }
    async create(dto, actor) {
        this.assertDateRange(dto.start_date, dto.end_date);
        this.ownership.assertAccess(dto.organizationId, actor);
        await this.ensureActiveOrganization(dto.organizationId);
        await this.ensureActiveContentType(dto.contentTypeId);
        await this.ensureOrganizationContentTypeIsAvailable(dto.organizationId, dto.contentTypeId);
        const page = await this.prisma.$transaction(async (transaction) => {
            const status = dto.status ?? client_1.PageStatus.DRAFT;
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
                    publishedAt: status === client_1.PageStatus.PUBLISHED ? new Date() : null,
                    startDate: dto.start_date ? (0, calendar_date_util_1.toCalendarDate)(dto.start_date) : null,
                    endDate: dto.end_date ? (0, calendar_date_util_1.toCalendarDate)(dto.end_date) : null,
                    createdById: actor.id,
                    updatedById: actor.id,
                },
            });
            await this.createAuditLog(transaction, actor.id, 'CREATE', createdPage);
            return createdPage;
        });
        return this.toResponse(page);
    }
    async findAll(query, actor) {
        if (query.organizationId)
            this.ownership.assertAccess(query.organizationId, actor);
        const where = this.buildWhere(query, actor);
        const orderBy = query.sort === 'display_order'
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
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findOne(id, actor) {
        const page = await this.findActivePage(id);
        this.ownership.assertAccess(page.organizationId, actor);
        return this.toResponse(page);
    }
    async findBySlug(slug, actor) {
        const page = await this.prisma.page.findFirst({
            where: { slug, isDeleted: false },
        });
        if (!page)
            throw new common_1.NotFoundException('Page not found.');
        this.ownership.assertAccess(page.organizationId, actor);
        return this.toResponse(page);
    }
    async findPublic(query) {
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
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findPublicBySlug(slug) {
        const page = await this.prisma.page.findFirst({
            where: { slug, ...this.publicWhere({}) },
        });
        if (!page)
            throw new common_1.NotFoundException('Public page not found.');
        return this.toPublicResponse(page);
    }
    async update(id, dto, actor) {
        const existingPage = await this.findActivePage(id);
        this.ownership.assertAccess(existingPage.organizationId, actor);
        const organizationId = dto.organizationId ?? existingPage.organizationId;
        const contentTypeId = dto.contentTypeId ?? existingPage.contentTypeId;
        this.assertDateRange(dto.start_date === undefined
            ? (0, calendar_date_util_1.formatCalendarDate)(existingPage.startDate)
            : dto.start_date, dto.end_date === undefined
            ? (0, calendar_date_util_1.formatCalendarDate)(existingPage.endDate)
            : dto.end_date);
        this.ownership.assertAccess(organizationId, actor);
        await this.ensureActiveOrganization(organizationId);
        await this.ensureActiveContentType(contentTypeId);
        if (organizationId !== existingPage.organizationId ||
            contentTypeId !== existingPage.contentTypeId) {
            await this.ensureOrganizationContentTypeIsAvailable(organizationId, contentTypeId, id);
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
                            slug: await this.generateUniqueSlug(dto.titleEnglish, transaction, id),
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
                                ? (0, calendar_date_util_1.toCalendarDate)(dto.start_date)
                                : null,
                        }),
                    ...(dto.end_date === undefined
                        ? {}
                        : { endDate: dto.end_date ? (0, calendar_date_util_1.toCalendarDate)(dto.end_date) : null }),
                    updatedById: actor.id,
                },
            });
            await this.createAuditLog(transaction, actor.id, 'UPDATE', updatedPage, existingPage);
            return updatedPage;
        });
        return this.toResponse(page);
    }
    async publish(id, actor) {
        return this.updatePublication(id, client_1.PageStatus.PUBLISHED, 'PUBLISH', actor);
    }
    async unpublish(id, actor) {
        return this.updatePublication(id, client_1.PageStatus.DRAFT, 'UNPUBLISH', actor);
    }
    async remove(id, actor) {
        const page = await this.prisma.$transaction(async (transaction) => {
            const existingPage = await transaction.page.findFirst({
                where: { id, isDeleted: false },
            });
            if (!existingPage)
                throw new common_1.NotFoundException('Page not found or has already been deleted.');
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
            await this.createAuditLog(transaction, actor.id, 'DELETE', deletedPage, existingPage);
            return deletedPage;
        });
        return this.toResponse(page);
    }
    async restore(id, actor) {
        const page = await this.prisma.$transaction(async (transaction) => {
            const existingPage = await transaction.page.findFirst({
                where: { id, isDeleted: true },
            });
            if (!existingPage)
                throw new common_1.NotFoundException('Deleted page not found.');
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
            await this.createAuditLog(transaction, actor.id, 'RESTORE', restoredPage, existingPage);
            return restoredPage;
        });
        return this.toResponse(page);
    }
    async updatePublication(id, status, action, actor) {
        const page = await this.prisma.$transaction(async (transaction) => {
            const existingPage = await transaction.page.findFirst({
                where: { id, isDeleted: false },
            });
            if (!existingPage)
                throw new common_1.NotFoundException('Page not found or has been deleted.');
            this.ownership.assertAccess(existingPage.organizationId, actor);
            const updatedPage = await transaction.page.update({
                where: { id },
                data: {
                    status,
                    publishedAt: status === client_1.PageStatus.PUBLISHED ? new Date() : null,
                    updatedById: actor.id,
                },
            });
            await this.createAuditLog(transaction, actor.id, action, updatedPage, existingPage);
            return updatedPage;
        });
        return this.toResponse(page);
    }
    async findActivePage(id) {
        const page = await this.prisma.page.findFirst({
            where: { id, isDeleted: false },
        });
        if (!page)
            throw new common_1.NotFoundException('Page not found or has been deleted.');
        return page;
    }
    async ensureActiveOrganization(id) {
        const organization = await this.prisma.organization.findFirst({
            where: { id, isDeleted: false },
            select: { id: true },
        });
        if (!organization)
            throw new common_1.NotFoundException('Organization not found or has been deleted.');
    }
    async ensureActiveContentType(id) {
        const contentType = await this.prisma.contentType.findFirst({
            where: { id, isDeleted: false },
            select: { id: true },
        });
        if (!contentType)
            throw new common_1.NotFoundException('Content type not found or has been deleted.');
    }
    async ensureOrganizationContentTypeIsAvailable(organizationId, contentTypeId, excludedId) {
        const duplicate = await this.prisma.page.findFirst({
            where: {
                organizationId,
                contentTypeId,
                ...(excludedId ? { id: { not: excludedId } } : {}),
            },
            select: { id: true },
        });
        if (duplicate)
            throw new common_1.ConflictException('An organization can only have one page for each content type.');
    }
    buildWhere(query, actor) {
        const where = {
            isDeleted: query.isDeleted ?? false,
            ...(query.contentTypeId ? { contentTypeId: query.contentTypeId } : {}),
            ...(query.status ? { status: query.status } : {}),
            ...(actor.role === client_1.Role.SUPER_ADMIN
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
    publicWhere(query) {
        const today = (0, calendar_date_util_1.toCalendarDate)(new Date().toISOString().slice(0, 10));
        return {
            isDeleted: false,
            status: client_1.PageStatus.PUBLISHED,
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
    assertDateRange(startDate, endDate) {
        if ((0, calendar_date_util_1.isInvalidDateRange)(startDate, endDate))
            throw new common_1.ConflictException('End date must not be earlier than start date.');
    }
    async generateUniqueSlug(title, transaction, excludedId) {
        const baseSlug = this.slugify(title) || 'page';
        let slug = baseSlug;
        let suffix = 2;
        while (true) {
            const duplicate = await transaction.page.findFirst({
                where: { slug, ...(excludedId ? { id: { not: excludedId } } : {}) },
                select: { id: true },
            });
            if (!duplicate)
                return slug;
            const suffixValue = `-${suffix++}`;
            slug = `${baseSlug.slice(0, 255 - suffixValue.length)}${suffixValue}`;
        }
    }
    slugify(value) {
        return value
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 255);
    }
    async createAuditLog(transaction, userId, action, newPage, previousPage) {
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
    toResponse(page) {
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
            start_date: (0, calendar_date_util_1.formatCalendarDate)(page.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(page.endDate),
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
        };
    }
    toPublicResponse(page) {
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
            start_date: (0, calendar_date_util_1.formatCalendarDate)(page.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(page.endDate),
        };
    }
    toAuditValues(page) {
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
};
exports.PagesService = PagesService;
exports.PagesService = PagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        organization_ownership_service_1.OrganizationOwnershipService])
], PagesService);
//# sourceMappingURL=pages.service.js.map