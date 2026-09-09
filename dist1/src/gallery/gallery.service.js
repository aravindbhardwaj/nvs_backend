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
exports.GalleryService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const organization_ownership_service_1 = require("../auth/services/organization-ownership.service");
const calendar_date_util_1 = require("../common/utils/calendar-date.util");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
const gallery_storage_1 = require("./gallery.storage");
let GalleryService = class GalleryService {
    prisma;
    ownership;
    constructor(prisma, ownership) {
        this.prisma = prisma;
        this.ownership = ownership;
    }
    async create(dto, file, actor) {
        await (0, gallery_storage_1.validateGalleryImage)(file);
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
                    visibleToAll: dto.visible_to_all ?? null,
                    startDate: dto.start_date ? (0, calendar_date_util_1.toCalendarDate)(dto.start_date) : null,
                    endDate: dto.end_date ? (0, calendar_date_util_1.toCalendarDate)(dto.end_date) : null,
                    createdById: actor.id,
                    updatedById: actor.id,
                },
            });
            await this.audit(tx, actor.id, 'CREATE', created);
            return created;
        });
        return this.response(image);
    }
    async bulkCreate(dto, files, actor) {
        await Promise.all(files.map(gallery_storage_1.validateGalleryImage));
        this.assertDateRange(dto.start_date, dto.end_date);
        const organizationId = dto.organizationId ?? actor.organizationId;
        this.ownership.assertAccess(organizationId, actor);
        await this.ensureActiveOrganization(organizationId);
        const images = await this.prisma.$transaction(async (tx) => Promise.all(files.map(async (file, index) => {
            const created = await tx.galleryImage.create({
                data: {
                    organizationId,
                    titleEnglish: dto.titleEnglish || this.filenameTitle(file.originalname),
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
                    visibleToAll: dto.visible_to_all ?? null,
                    startDate: dto.start_date ? (0, calendar_date_util_1.toCalendarDate)(dto.start_date) : null,
                    endDate: dto.end_date ? (0, calendar_date_util_1.toCalendarDate)(dto.end_date) : null,
                    createdById: actor.id,
                    updatedById: actor.id,
                },
            });
            await this.audit(tx, actor.id, 'BULK_UPLOAD', created);
            return created;
        })));
        return images.map((image) => this.response(image));
    }
    async findAll(query, actor) {
        if (query.organizationId)
            this.ownership.assertAccess(query.organizationId, actor);
        const where = this.where(query, actor);
        const [images, totalItems] = await this.prisma.$transaction([
            this.prisma.galleryImage.findMany({
                include: { organization: { select: { organizationName: true } } },
                where,
                orderBy: query.sort === 'display_order'
                    ? [
                        { display_order: query.order },
                        { createdAt: 'desc' },
                        { id: 'desc' },
                    ]
                    : { [query.sort]: query.order },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.galleryImage.count({ where }),
        ]);
        return {
            items: images.map((image) => ({
                ...this.response(image),
                organization_name: image.organization.organizationName,
            })),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findOne(id, actor) {
        const image = await this.viewable(id, actor);
        return this.response(image);
    }
    async update(id, dto, actor) {
        const previous = await this.active(id);
        this.ownership.assertAccess(previous.organizationId, actor);
        this.assertDateRange(dto.start_date === undefined
            ? (0, calendar_date_util_1.formatCalendarDate)(previous.startDate)
            : dto.start_date, dto.end_date === undefined
            ? (0, calendar_date_util_1.formatCalendarDate)(previous.endDate)
            : dto.end_date);
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
            await this.audit(tx, actor.id, 'UPDATE', updated, previous);
            return updated;
        });
        return this.response(image);
    }
    async replaceImage(id, file, actor) {
        await (0, gallery_storage_1.validateGalleryImage)(file);
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
        }
        catch {
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
            throw new common_1.InternalServerErrorException('Unable to replace the existing gallery image.');
        }
        return this.response(image);
    }
    async remove(id, actor) {
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
    async bulkRemove(ids, actor) {
        const images = await this.prisma.galleryImage.findMany({
            where: { id: { in: ids }, isDeleted: false },
        });
        if (images.length !== ids.length)
            throw new common_1.NotFoundException('One or more gallery images were not found.');
        images.forEach((image) => this.ownership.assertAccess(image.organizationId, actor));
        const deleted = await this.prisma.$transaction(async (tx) => Promise.all(images.map(async (previous) => {
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
        })));
        return deleted.map((image) => this.response(image));
    }
    async reorder(dto, actor) {
        const images = await this.prisma.galleryImage.findMany({
            where: { id: { in: dto.images.map(({ id }) => id) }, isDeleted: false },
        });
        if (images.length !== dto.images.length)
            throw new common_1.NotFoundException('One or more gallery images were not found.');
        images.forEach((image) => this.ownership.assertAccess(image.organizationId, actor));
        await this.prisma.$transaction(async (tx) => Promise.all(dto.images.map(async ({ id, display_order }) => {
            const previous = images.find((image) => image.id === id);
            const updated = await tx.galleryImage.update({
                where: { id },
                data: { display_order, updatedById: actor.id },
            });
            await this.audit(tx, actor.id, 'REORDER', updated, previous);
        })));
    }
    async findPublic(query) {
        const where = await this.publicWhere(query.organization_id);
        const [images, totalItems] = await this.prisma.$transaction([
            this.prisma.galleryImage.findMany({
                where,
                orderBy: [
                    { display_order: 'asc' },
                    { createdAt: 'desc' },
                    { id: 'desc' },
                ],
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.galleryImage.count({ where }),
        ]);
        return {
            items: images.map((image) => this.publicResponse(image, query.organization_id)),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async imageStream(id, actor, organizationId) {
        const image = actor
            ? await this.viewable(id, actor)
            : await this.prisma.galleryImage.findFirst({
                where: { id, ...(await this.publicWhere(organizationId)) },
            });
        if (!image)
            throw new common_1.NotFoundException('Gallery image not found.');
        const path = this.absolutePath(image.imagePath);
        await (0, promises_1.access)(path).catch(() => {
            throw new common_1.NotFoundException('The gallery image is no longer available.');
        });
        return { stream: (0, node_fs_1.createReadStream)(path), mimeType: image.mimeType };
    }
    async cleanupUploadedFiles(files = []) {
        await Promise.all(files.map((file) => (0, promises_1.unlink)(file.path).catch(() => undefined)));
    }
    async active(id) {
        const image = await this.prisma.galleryImage.findFirst({
            where: { id, isDeleted: false },
        });
        if (!image)
            throw new common_1.NotFoundException('Gallery image not found or has been deleted.');
        return image;
    }
    async viewable(id, actor) {
        const visibility = this.visibilityWhere({}, actor);
        const image = await this.prisma.galleryImage.findFirst({
            where: {
                id,
                isDeleted: false,
                ...(visibility ? { AND: [visibility] } : {}),
            },
        });
        if (!image)
            throw new common_1.NotFoundException('Gallery image not found or has been deleted.');
        return image;
    }
    assertDateRange(startDate, endDate) {
        if ((0, calendar_date_util_1.isInvalidDateRange)(startDate, endDate))
            throw new common_1.BadRequestException('End date must not be earlier than start date.');
    }
    async ensureActiveOrganization(id) {
        const organization = await this.prisma.organization.findFirst({
            where: { id, isDeleted: false },
            select: { id: true },
        });
        if (!organization)
            throw new common_1.NotFoundException('Organization not found or has been deleted.');
    }
    where(query, actor) {
        const where = {
            isDeleted: query.isDeleted ?? false,
            ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
        };
        const visibility = this.visibilityWhere(query, actor);
        if (visibility)
            where.AND = [visibility];
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
    visibilityWhere(query, actor) {
        if (actor.role === client_1.Role.SUPER_ADMIN)
            return query.organizationId
                ? { organizationId: query.organizationId }
                : undefined;
        if (query.organizationId)
            return { organizationId: actor.organizationId };
        const own = { organizationId: actor.organizationId };
        const headquartersShared = {
            visibleToAll: true,
            organization: { organizationType: { code: 'HEADQUARTER' } },
        };
        if (actor.role === client_1.Role.HEADQUARTER)
            return own;
        if (actor.role === client_1.Role.NLI || actor.role === client_1.Role.REGIONAL)
            return { OR: [own, headquartersShared] };
        if (actor.role === client_1.Role.JNV)
            return {
                OR: [
                    own,
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
        return own;
    }
    async publicWhere(organizationId) {
        if (organizationId !== undefined &&
            (!Number.isSafeInteger(organizationId) || organizationId < 1))
            throw new common_1.BadRequestException('organization_id must be a positive integer.');
        const now = new Date();
        const dates = [
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ];
        const base = { isDeleted: false, isActive: true };
        if (organizationId === undefined)
            return { ...base, AND: [...dates, { visibleToAll: true }] };
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
        const visible = [
            { organizationId: organization.id },
            {
                visibleToAll: true,
                organization: { organizationType: { code: 'HEADQUARTER' } },
            },
        ];
        if (organization.organizationType.code === 'JNV' &&
            organization.parentOrganizationId)
            visible.push({
                visibleToAll: true,
                organizationId: organization.parentOrganizationId,
                organization: { organizationType: { code: 'REGIONAL_OFFICE' } },
            });
        return { ...base, AND: [...dates, { OR: visible }] };
    }
    async audit(tx, userId, action, image, previous) {
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
    response(image) {
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
            visible_to_all: image.visibleToAll,
            start_date: (0, calendar_date_util_1.formatCalendarDate)(image.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(image.endDate),
            createdAt: image.createdAt,
            updatedAt: image.updatedAt,
            isDeleted: image.isDeleted,
        };
    }
    publicResponse(image, organizationId) {
        return {
            id: image.id,
            title_english: image.titleEnglish,
            title_hindi: image.titleHindi,
            description_english: image.descriptionEnglish,
            description_hindi: image.descriptionHindi,
            alt_text_english: image.altTextEnglish,
            alt_text_hindi: image.altTextHindi,
            image_url: `/api/public/gallery/${image.id}/image${organizationId ? `?organization_id=${organizationId}` : ''}`,
            display_order: image.display_order,
            start_date: (0, calendar_date_util_1.formatCalendarDate)(image.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(image.endDate),
        };
    }
    auditValues(image) {
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
            visibleToAll: image.visibleToAll,
            start_date: (0, calendar_date_util_1.formatCalendarDate)(image.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(image.endDate),
            isDeleted: image.isDeleted,
        };
    }
    extension(filename) {
        return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
    }
    filenameTitle(filename) {
        return filename.replace(/\.[^.]+$/, '').slice(0, 255);
    }
    storedPath(filePath) {
        return (0, node_path_1.relative)(process.cwd(), filePath);
    }
    absolutePath(filePath) {
        const path = (0, node_path_1.resolve)(process.cwd(), filePath);
        if (!path.startsWith(`${gallery_storage_1.GALLERY_UPLOADS_ROOT}/`))
            throw new common_1.NotFoundException('Gallery image not found.');
        return path;
    }
    async removeFile(filePath) {
        await (0, promises_1.unlink)(this.absolutePath(filePath));
    }
};
exports.GalleryService = GalleryService;
exports.GalleryService = GalleryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        organization_ownership_service_1.OrganizationOwnershipService])
], GalleryService);
//# sourceMappingURL=gallery.service.js.map