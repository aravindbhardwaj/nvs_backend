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
exports.BannersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const organization_ownership_service_1 = require("../auth/services/organization-ownership.service");
const calendar_date_util_1 = require("../common/utils/calendar-date.util");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
const banner_storage_1 = require("./banner.storage");
let BannersService = class BannersService {
    prisma;
    ownership;
    configService;
    constructor(prisma, ownership, configService) {
        this.prisma = prisma;
        this.ownership = ownership;
        this.configService = configService;
    }
    async create(dto, file, actor) {
        await (0, banner_storage_1.validateBannerImage)(file);
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
                    linkUrl: dto.link_url ?? null,
                    storedFilename: file.filename,
                    imagePath: this.toStoredPath(file.path),
                    mimeType: file.mimetype,
                    extension: this.extensionOf(file.originalname),
                    fileSize: BigInt(file.size),
                    display_order: dto.display_order ?? 0,
                    isActive: dto.isActive ?? true,
                    visibleToAll: dto.visible_to_all ?? null,
                    startDate: dto.start_date ? (0, calendar_date_util_1.toCalendarDate)(dto.start_date) : null,
                    endDate: dto.end_date ? (0, calendar_date_util_1.toCalendarDate)(dto.end_date) : null,
                    createdById: actor.id,
                    updatedById: actor.id,
                },
            });
            await this.createAuditLog(transaction, actor.id, 'CREATE', createdBanner);
            return createdBanner;
        });
        return this.toResponse(banner);
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
        const [banners, totalItems] = await this.prisma.$transaction([
            this.prisma.banner.findMany({
                include: { organization: { select: { organizationName: true } } },
                where,
                orderBy,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.banner.count({ where }),
        ]);
        return {
            items: banners.map((banner) => ({
                ...this.toResponse(banner),
                organization_name: banner.organization.organizationName,
            })),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findOne(id, actor) {
        const banner = await this.findViewableBanner(id, actor);
        return this.toResponse(banner);
    }
    async update(id, dto, actor) {
        const existing = await this.findActiveBanner(id);
        this.ownership.assertAccess(existing.organizationId, actor);
        this.assertDisplayDates(dto.start_date === undefined
            ? (0, calendar_date_util_1.formatCalendarDate)(existing.startDate)
            : dto.start_date, dto.end_date === undefined
            ? (0, calendar_date_util_1.formatCalendarDate)(existing.endDate)
            : dto.end_date);
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
                    ...(dto.link_url === undefined ? {} : { linkUrl: dto.link_url }),
                    display_order: dto.display_order,
                    isActive: dto.isActive,
                    ...(dto.visible_to_all === undefined
                        ? {}
                        : { visibleToAll: dto.visible_to_all }),
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
            await this.createAuditLog(transaction, actor.id, 'UPDATE', updatedBanner, existing);
            return updatedBanner;
        });
        return this.toResponse(banner);
    }
    async replaceImage(id, file, actor) {
        await (0, banner_storage_1.validateBannerImage)(file);
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
            await this.createAuditLog(transaction, actor.id, 'REPLACE_IMAGE', updatedBanner, existing);
            return updatedBanner;
        });
        try {
            await this.removePhysicalFile(existing.imagePath);
        }
        catch {
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
            await this.removePhysicalFile(replacementData.imagePath).catch(() => undefined);
            throw new common_1.InternalServerErrorException('Unable to replace the existing banner image.');
        }
        return this.toResponse(banner);
    }
    async setActive(id, isActive, actor) {
        const existing = await this.findActiveBanner(id);
        this.ownership.assertAccess(existing.organizationId, actor);
        const banner = await this.prisma.$transaction(async (transaction) => {
            if (isActive && !existing.isActive)
                await this.assertBannerUploadLimit(transaction, existing.organizationId);
            const updatedBanner = await transaction.banner.update({
                where: { id },
                data: { isActive, updatedById: actor.id },
            });
            await this.createAuditLog(transaction, actor.id, isActive ? 'ACTIVATE' : 'DEACTIVATE', updatedBanner, existing);
            return updatedBanner;
        });
        return this.toResponse(banner);
    }
    async remove(id, actor) {
        const banner = await this.prisma.$transaction(async (transaction) => {
            const existing = await transaction.banner.findFirst({
                where: { id, isDeleted: false },
            });
            if (!existing)
                throw new common_1.NotFoundException('Banner not found or has already been deleted.');
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
            await this.createAuditLog(transaction, actor.id, 'DELETE', deletedBanner, existing);
            return deletedBanner;
        });
        return this.toResponse(banner);
    }
    async restore(id, actor) {
        const banner = await this.prisma.$transaction(async (transaction) => {
            const existing = await transaction.banner.findFirst({
                where: { id, isDeleted: true },
            });
            if (!existing)
                throw new common_1.NotFoundException('Deleted banner not found.');
            this.ownership.assertAccess(existing.organizationId, actor);
            if (existing.isActive)
                await this.assertBannerUploadLimit(transaction, existing.organizationId);
            const restoredBanner = await transaction.banner.update({
                where: { id },
                data: {
                    isDeleted: false,
                    deletedAt: null,
                    deletedById: null,
                    updatedById: actor.id,
                },
            });
            await this.createAuditLog(transaction, actor.id, 'RESTORE', restoredBanner, existing);
            return restoredBanner;
        });
        return this.toResponse(banner);
    }
    async findDisplayable(query) {
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
            items: banners.map((banner) => this.toPublicResponse(banner, query.organization_id)),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async imageStream(id, actor) {
        const banner = await this.findViewableBanner(id, actor);
        return this.openImage(banner);
    }
    async publicImageStream(id, organizationId) {
        const banner = await this.prisma.banner.findFirst({
            where: { id, ...(await this.publicDisplayableWhere(organizationId)) },
        });
        if (!banner)
            throw new common_1.NotFoundException('Displayable banner not found.');
        return this.openImage(banner);
    }
    async cleanupUploadedFile(file) {
        if (file)
            await (0, promises_1.unlink)(file.path).catch(() => undefined);
    }
    async openImage(banner) {
        const imagePath = this.absolutePath(banner.imagePath);
        try {
            await (0, promises_1.access)(imagePath);
        }
        catch {
            throw new common_1.NotFoundException('The banner image is no longer available.');
        }
        return { stream: (0, node_fs_1.createReadStream)(imagePath), mimeType: banner.mimeType };
    }
    async findActiveBanner(id) {
        const banner = await this.prisma.banner.findFirst({
            where: { id, isDeleted: false },
        });
        if (!banner)
            throw new common_1.NotFoundException('Banner not found or has been deleted.');
        return banner;
    }
    async findViewableBanner(id, actor) {
        const visibilityWhere = this.visibilityWhere({}, actor);
        const banner = await this.prisma.banner.findFirst({
            where: {
                id,
                isDeleted: false,
                ...(visibilityWhere ? { AND: [visibilityWhere] } : {}),
            },
        });
        if (!banner)
            throw new common_1.NotFoundException('Banner not found or has been deleted.');
        return banner;
    }
    async ensureActiveOrganization(id) {
        const organization = await this.prisma.organization.findFirst({
            where: { id, isDeleted: false },
            select: { id: true },
        });
        if (!organization)
            throw new common_1.NotFoundException('Organization not found or has been deleted.');
    }
    buildWhere(query, actor) {
        const where = {
            isDeleted: query.isDeleted ?? false,
            ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
        };
        const visibilityWhere = this.visibilityWhere(query, actor);
        if (visibilityWhere)
            where.AND = [visibilityWhere];
        if (query.search?.trim()) {
            const searchWhere = {
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
    visibilityWhere(query, actor) {
        if (actor.role === client_1.Role.SUPER_ADMIN) {
            return query.organizationId
                ? { organizationId: query.organizationId }
                : undefined;
        }
        if (query.organizationId)
            return { organizationId: actor.organizationId };
        const headquartersShared = {
            visibleToAll: true,
            organization: { organizationType: { code: 'HEADQUARTER' } },
        };
        const ownOrganization = {
            organizationId: actor.organizationId,
        };
        if (actor.role === client_1.Role.HEADQUARTER)
            return ownOrganization;
        if (actor.role === client_1.Role.NLI || actor.role === client_1.Role.REGIONAL) {
            return { OR: [ownOrganization, headquartersShared] };
        }
        if (actor.role === client_1.Role.JNV) {
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
    async assertBannerUploadLimit(transaction, organizationId) {
        const limit = this.maxBannersPerOrganization();
        const count = await transaction.banner.count({
            where: { organizationId, isDeleted: false, isActive: true },
        });
        if (count >= limit) {
            throw new common_1.BadRequestException('Banner limit reached. Please deactivate, delete, or replace an existing banner to continue.');
        }
    }
    maxBannersPerOrganization() {
        const configured = this.configService.get('banner.maxBannersPerOrganization', 5);
        return Number.isSafeInteger(configured) && configured > 0 ? configured : 5;
    }
    displayableWhere(organizationId) {
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
    async publicDisplayableWhere(organizationId) {
        if (organizationId !== undefined &&
            (!Number.isSafeInteger(organizationId) || organizationId < 1))
            throw new common_1.BadRequestException('organization_id must be a positive integer.');
        const base = this.displayableWhere();
        const dateConditions = base.AND
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
        if (!organization)
            throw new common_1.NotFoundException('Organization not found.');
        const sharedFromHeadquarters = {
            visibleToAll: true,
            organization: { organizationType: { code: 'HEADQUARTER' } },
        };
        const visibleToOrganization = [
            { organizationId: organization.id },
            sharedFromHeadquarters,
        ];
        if (organization.organizationType.code === 'JNV' &&
            organization.parentOrganizationId) {
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
    assertDisplayDates(startDate, endDate) {
        if ((0, calendar_date_util_1.isInvalidDateRange)(startDate, endDate)) {
            throw new common_1.BadRequestException('End date must not be earlier than start date.');
        }
    }
    async createAuditLog(transaction, userId, action, banner, previousBanner) {
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
    toResponse(banner) {
        return {
            id: banner.id,
            organizationId: banner.organizationId,
            titleEnglish: banner.titleEnglish,
            titleHindi: banner.titleHindi,
            descriptionEnglish: banner.descriptionEnglish,
            descriptionHindi: banner.descriptionHindi,
            altTextEnglish: banner.altTextEnglish,
            altTextHindi: banner.altTextHindi,
            link_url: banner.linkUrl,
            imageUrl: `/api/banners/${banner.id}/image`,
            mimeType: banner.mimeType,
            extension: banner.extension,
            fileSize: banner.fileSize.toString(),
            display_order: banner.display_order,
            isActive: banner.isActive,
            visible_to_all: banner.visibleToAll,
            start_date: (0, calendar_date_util_1.formatCalendarDate)(banner.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(banner.endDate),
            createdAt: banner.createdAt,
            updatedAt: banner.updatedAt,
            isDeleted: banner.isDeleted,
        };
    }
    toPublicResponse(banner, organizationId) {
        return {
            id: banner.id,
            title_english: banner.titleEnglish,
            title_hindi: banner.titleHindi,
            description_english: banner.descriptionEnglish,
            description_hindi: banner.descriptionHindi,
            alt_text_english: banner.altTextEnglish,
            alt_text_hindi: banner.altTextHindi,
            link_url: banner.linkUrl,
            image_url: `/api/public/banners/${banner.id}/image${organizationId ? `?organization_id=${organizationId}` : ''}`,
            display_order: banner.display_order,
            start_date: (0, calendar_date_util_1.formatCalendarDate)(banner.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(banner.endDate),
        };
    }
    toAuditValues(banner) {
        return {
            id: banner.id,
            organizationId: banner.organizationId,
            titleEnglish: banner.titleEnglish,
            titleHindi: banner.titleHindi,
            descriptionEnglish: banner.descriptionEnglish,
            descriptionHindi: banner.descriptionHindi,
            altTextEnglish: banner.altTextEnglish,
            altTextHindi: banner.altTextHindi,
            linkUrl: banner.linkUrl,
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
    extensionOf(filename) {
        return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
    }
    toStoredPath(filePath) {
        return (0, node_path_1.relative)(process.cwd(), filePath);
    }
    absolutePath(filePath) {
        const absolutePath = (0, node_path_1.resolve)(process.cwd(), filePath);
        if (!absolutePath.startsWith(`${banner_storage_1.BANNER_UPLOADS_ROOT}/`)) {
            throw new common_1.NotFoundException('Banner image not found.');
        }
        return absolutePath;
    }
    async removePhysicalFile(filePath) {
        await (0, promises_1.unlink)(this.absolutePath(filePath));
    }
};
exports.BannersService = BannersService;
exports.BannersService = BannersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        organization_ownership_service_1.OrganizationOwnershipService,
        config_1.ConfigService])
], BannersService);
//# sourceMappingURL=banners.service.js.map