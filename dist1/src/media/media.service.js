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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const organization_ownership_service_1 = require("../auth/services/organization-ownership.service");
const calendar_date_util_1 = require("../common/utils/calendar-date.util");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
const media_storage_1 = require("./media.storage");
let MediaService = class MediaService {
    prisma;
    ownership;
    constructor(prisma, ownership) {
        this.prisma = prisma;
        this.ownership = ownership;
    }
    async createExternal(dto, actor) {
        const startDate = dto.start_date?.trim() || new Date().toISOString().slice(0, 10);
        this.assertDateRange(startDate, dto.end_date);
        const organizationId = dto.organizationId ?? actor.organizationId;
        this.ownership.assertAccess(organizationId, actor);
        await this.ensureActiveOrganization(organizationId);
        await this.ensureActiveMediaType(dto.mediaTypeId);
        const sharedMediaTypeIds = await this.resolveSharedMediaTypeIds(dto.sharedMediaTypeIds, dto.mediaTypeId);
        const visibility = await this.resolveVisibility(dto, organizationId);
        const media = await this.prisma.$transaction(async (transaction) => {
            const createdMedia = await transaction.media.create({
                data: {
                    organizationId,
                    mediaTypeId: dto.mediaTypeId,
                    sourceType: client_1.MediaSourceType.EXTERNAL,
                    externalUrl: dto.externalUrl,
                    titleEnglish: dto.titleEnglish,
                    titleHindi: dto.titleHindi,
                    descriptionEnglish: dto.descriptionEnglish ?? null,
                    descriptionHindi: dto.descriptionHindi ?? null,
                    startDate: (0, calendar_date_util_1.toCalendarDate)(startDate),
                    endDate: dto.end_date ? (0, calendar_date_util_1.toCalendarDate)(dto.end_date) : null,
                    display_order: dto.display_order ?? 0,
                    isActive: dto.is_active ?? true,
                    isNew: dto.is_new ?? null,
                    visibleToAll: visibility.visibleToAll,
                    roIds: visibility.roIds,
                    jnvIds: visibility.jnvIds,
                    sharedMediaTypeIds,
                    importantLink1: dto.important_link_1 ?? null,
                    importantLink2: dto.important_link_2 ?? null,
                    importantLink3: dto.important_link_3 ?? null,
                    createdById: actor.id,
                    updatedById: actor.id,
                },
            });
            await this.createAuditLog(transaction, actor.id, 'CREATE', createdMedia);
            return createdMedia;
        });
        return this.toResponse(media, await this.sharedMediaPlacementNames([media]));
    }
    async upload(dto, file, hindiFile, actor) {
        (0, media_storage_1.validateMediaFile)(file);
        if (hindiFile)
            (0, media_storage_1.validateMediaFile)(hindiFile);
        const startDate = dto.start_date?.trim() || new Date().toISOString().slice(0, 10);
        this.assertDateRange(startDate, dto.end_date);
        const organizationId = dto.organizationId ?? actor.organizationId;
        this.ownership.assertAccess(organizationId, actor);
        await this.ensureActiveOrganization(organizationId);
        await this.ensureActiveMediaType(dto.mediaTypeId);
        const sharedMediaTypeIds = await this.resolveSharedMediaTypeIds(dto.sharedMediaTypeIds, dto.mediaTypeId);
        const visibility = await this.resolveVisibility(dto, organizationId);
        const media = await this.prisma.$transaction(async (transaction) => {
            const createdMedia = await transaction.media.create({
                data: {
                    organizationId,
                    mediaTypeId: dto.mediaTypeId,
                    sourceType: client_1.MediaSourceType.FILE,
                    titleEnglish: dto.titleEnglish,
                    titleHindi: dto.titleHindi,
                    descriptionEnglish: dto.descriptionEnglish ?? null,
                    descriptionHindi: dto.descriptionHindi ?? null,
                    startDate: (0, calendar_date_util_1.toCalendarDate)(startDate),
                    endDate: dto.end_date ? (0, calendar_date_util_1.toCalendarDate)(dto.end_date) : null,
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
                    isNew: dto.is_new ?? null,
                    visibleToAll: visibility.visibleToAll,
                    roIds: visibility.roIds,
                    jnvIds: visibility.jnvIds,
                    sharedMediaTypeIds,
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
        return this.toResponse(media, await this.sharedMediaPlacementNames([media]));
    }
    async findAll(query, actor) {
        if (query.organizationId)
            this.ownership.assertAccess(query.organizationId, actor);
        const where = await this.buildWhere(query, actor);
        const orderBy = this.orderBy(query);
        const [media, totalItems] = await this.prisma.$transaction([
            this.prisma.media.findMany({
                include: { organization: { select: { organizationName: true } } },
                where,
                orderBy,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.media.count({ where }),
        ]);
        const placementNames = await this.sharedMediaPlacementNames(media);
        return {
            items: media.map((item) => ({
                ...this.toResponse(item, placementNames),
                organization_name: item.organization.organizationName,
            })),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findOne(id, actor) {
        const media = await this.findViewableMedia(id, actor);
        return this.toResponse(media, await this.sharedMediaPlacementNames([media]));
    }
    async download(id, actor) {
        const media = await this.findViewableMedia(id, actor);
        this.assertDownloadableFile(media);
        const filePath = this.absolutePath(media.filePath);
        try {
            await (0, promises_1.access)(filePath);
        }
        catch {
            throw new common_1.NotFoundException('The document file is no longer available.');
        }
        return {
            stream: (0, node_fs_1.createReadStream)(filePath),
            filename: media.originalFilename,
            mimeType: media.mimeType,
        };
    }
    async downloadHindi(id, actor) {
        const media = await this.findViewableMedia(id, actor);
        if (!media.hindiFilePath ||
            !media.hindiOriginalFilename ||
            !media.hindiMimeType)
            throw new common_1.NotFoundException('Hindi document file is not available.');
        const filePath = this.absolutePath(media.hindiFilePath);
        try {
            await (0, promises_1.access)(filePath);
        }
        catch {
            throw new common_1.NotFoundException('The Hindi document file is no longer available.');
        }
        return {
            stream: (0, node_fs_1.createReadStream)(filePath),
            filename: media.hindiOriginalFilename,
            mimeType: media.hindiMimeType,
        };
    }
    async update(id, dto, actor) {
        const existing = await this.findActiveMedia(id);
        this.ownership.assertAccess(existing.organizationId, actor);
        if (dto.externalUrl !== undefined &&
            existing.sourceType !== client_1.MediaSourceType.EXTERNAL)
            throw new common_1.BadRequestException('An external URL can only be updated for external media.');
        if (dto.mediaTypeId !== undefined)
            await this.ensureActiveMediaType(dto.mediaTypeId);
        const mediaTypeId = dto.mediaTypeId ?? existing.mediaTypeId;
        const sharedMediaTypeIds = await this.resolveSharedMediaTypeIds(dto.sharedMediaTypeIds, mediaTypeId, existing.sharedMediaTypeIds);
        this.assertDateRange(dto.start_date === undefined
            ? (0, calendar_date_util_1.formatCalendarDate)(existing.startDate)
            : dto.start_date, dto.end_date === undefined
            ? (0, calendar_date_util_1.formatCalendarDate)(existing.endDate)
            : dto.end_date);
        const visibility = await this.resolveVisibility(dto, existing.organizationId, existing);
        const media = await this.prisma.$transaction(async (transaction) => {
            const updatedMedia = await transaction.media.update({
                where: { id },
                data: {
                    titleEnglish: dto.titleEnglish,
                    titleHindi: dto.titleHindi,
                    descriptionEnglish: dto.descriptionEnglish,
                    descriptionHindi: dto.descriptionHindi,
                    externalUrl: dto.externalUrl,
                    mediaTypeId: dto.mediaTypeId,
                    ...(dto.sharedMediaTypeIds === undefined
                        ? {}
                        : { sharedMediaTypeIds }),
                    display_order: dto.display_order,
                    isActive: dto.is_active,
                    isNew: dto.is_new,
                    ...(dto.visible_to_all === undefined
                        ? {}
                        : { visibleToAll: visibility.visibleToAll }),
                    ...(dto.ro_ids === undefined ? {} : { roIds: visibility.roIds }),
                    ...(dto.jnv_ids === undefined ? {} : { jnvIds: visibility.jnvIds }),
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
                                ? (0, calendar_date_util_1.toCalendarDate)(dto.start_date)
                                : null,
                        }),
                    ...(dto.end_date === undefined
                        ? {}
                        : { endDate: dto.end_date ? (0, calendar_date_util_1.toCalendarDate)(dto.end_date) : null }),
                    updatedById: actor.id,
                },
            });
            await this.createAuditLog(transaction, actor.id, 'UPDATE', updatedMedia, existing);
            return updatedMedia;
        });
        return this.toResponse(media, await this.sharedMediaPlacementNames([media]));
    }
    async replaceFile(id, file, actor, isHindiFile = false) {
        (0, media_storage_1.validateMediaFile)(file);
        const existing = await this.findActiveMedia(id);
        this.ownership.assertAccess(existing.organizationId, actor);
        if (existing.sourceType !== client_1.MediaSourceType.FILE)
            throw new common_1.BadRequestException('A file can only be replaced for file-based media.');
        const replacementData = {
            ...(isHindiFile
                ? await this.hindiFileData(file)
                : {
                    originalFilename: this.sanitizeFilename(file.originalname),
                    storedFilename: file.filename,
                    filePath: this.toStoredPath(file.path),
                    mimeType: file.mimetype,
                    extension: this.extensionOf(file.originalname),
                    fileSize: BigInt(file.size),
                    checksum: await this.checksum(file.path),
                }),
            uploadedAt: new Date(),
            updatedById: actor.id,
        };
        const media = await this.prisma.$transaction(async (transaction) => {
            const updatedMedia = await transaction.media.update({
                where: { id },
                data: replacementData,
            });
            await this.createAuditLog(transaction, actor.id, 'REPLACE', updatedMedia, existing);
            return updatedMedia;
        });
        try {
            const previousFilePath = isHindiFile
                ? existing.hindiFilePath
                : existing.filePath;
            if (previousFilePath)
                await this.removePhysicalFile(previousFilePath);
        }
        catch {
            await this.prisma.media.update({
                where: { id },
                data: {
                    ...(isHindiFile
                        ? this.hindiMediaFileData(existing)
                        : this.mediaFileData(existing)),
                    updatedById: existing.updatedById,
                },
            });
            await this.removePhysicalFile(this.toStoredPath(file.path)).catch(() => undefined);
            throw new common_1.InternalServerErrorException('Unable to replace the existing document file.');
        }
        return this.toResponse(media, await this.sharedMediaPlacementNames([media]));
    }
    async remove(id, actor) {
        const media = await this.prisma.$transaction(async (transaction) => {
            const existing = await transaction.media.findFirst({
                where: { id, isDeleted: false },
            });
            if (!existing)
                throw new common_1.NotFoundException('Media not found or has already been deleted.');
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
            await this.createAuditLog(transaction, actor.id, 'DELETE', deletedMedia, existing);
            return deletedMedia;
        });
        return this.toResponse(media, await this.sharedMediaPlacementNames([media]));
    }
    async restore(id, actor) {
        const media = await this.prisma.$transaction(async (transaction) => {
            const existing = await transaction.media.findFirst({
                where: { id, isDeleted: true },
            });
            if (!existing)
                throw new common_1.NotFoundException('Deleted media not found.');
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
            await this.createAuditLog(transaction, actor.id, 'RESTORE', restoredMedia, existing);
            return restoredMedia;
        });
        return this.toResponse(media, await this.sharedMediaPlacementNames([media]));
    }
    async cleanupUploadedFiles(files) {
        await Promise.all(files
            .filter((file) => Boolean(file))
            .map((file) => (0, promises_1.unlink)(file.path).catch(() => undefined)));
    }
    async cleanupUploadedFile(file) {
        await this.cleanupUploadedFiles([file]);
    }
    async findPublic(query) {
        const where = await this.publicWhere(query);
        const [media, totalItems] = await this.prisma.$transaction([
            this.prisma.media.findMany({
                where,
                orderBy: [
                    { display_order: 'asc' },
                    { createdAt: 'desc' },
                    { id: 'desc' },
                ],
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.media.count({ where }),
        ]);
        const placementNames = await this.sharedMediaPlacementNames(media);
        return {
            items: media.map((item) => this.toPublicResponse(item, query.organization_id, placementNames)),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findImportantLinks(query, importantLink) {
        const where = await this.publicWhere(query, importantLink);
        const [media, totalItems] = await this.prisma.$transaction([
            this.prisma.media.findMany({
                where,
                orderBy: [
                    { display_order: 'asc' },
                    { createdAt: 'desc' },
                    { id: 'desc' },
                ],
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.media.count({ where }),
        ]);
        const placementNames = await this.sharedMediaPlacementNames(media);
        return {
            items: media.map((item) => this.toPublicResponse(item, query.organization_id, placementNames)),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async publicDownload(id, organizationId) {
        if (organizationId !== undefined &&
            (!Number.isSafeInteger(organizationId) || organizationId < 1))
            throw new common_1.BadRequestException('organization_id must be a positive integer.');
        const media = await this.prisma.media.findFirst({
            where: {
                id,
                ...(await this.publicWhere({ organization_id: organizationId })),
            },
        });
        if (!media)
            throw new common_1.NotFoundException('Public media not found.');
        this.assertDownloadableFile(media);
        const filePath = this.absolutePath(media.filePath);
        try {
            await (0, promises_1.access)(filePath);
        }
        catch {
            throw new common_1.NotFoundException('The document file is no longer available.');
        }
        return {
            stream: (0, node_fs_1.createReadStream)(filePath),
            filename: media.originalFilename,
            mimeType: media.mimeType,
        };
    }
    async publicDownloadHindi(id, organizationId) {
        if (organizationId !== undefined &&
            (!Number.isSafeInteger(organizationId) || organizationId < 1))
            throw new common_1.BadRequestException('organization_id must be a positive integer.');
        const media = await this.prisma.media.findFirst({
            where: {
                id,
                ...(await this.publicWhere({ organization_id: organizationId })),
            },
        });
        if (!media)
            throw new common_1.NotFoundException('Public media not found.');
        if (!media.hindiFilePath ||
            !media.hindiOriginalFilename ||
            !media.hindiMimeType)
            throw new common_1.NotFoundException('Hindi document file is not available.');
        const filePath = this.absolutePath(media.hindiFilePath);
        try {
            await (0, promises_1.access)(filePath);
        }
        catch {
            throw new common_1.NotFoundException('The Hindi document file is no longer available.');
        }
        return {
            stream: (0, node_fs_1.createReadStream)(filePath),
            filename: media.hindiOriginalFilename,
            mimeType: media.hindiMimeType,
        };
    }
    async findActiveMedia(id) {
        const media = await this.prisma.media.findFirst({
            where: { id, isDeleted: false },
        });
        if (!media)
            throw new common_1.NotFoundException('Media not found or has been deleted.');
        return media;
    }
    async findViewableMedia(id, actor) {
        const visibilityWhere = await this.visibilityWhere({}, actor);
        const media = await this.prisma.media.findFirst({
            where: {
                id,
                isDeleted: false,
                ...(visibilityWhere ? { AND: [visibilityWhere] } : {}),
            },
        });
        if (!media)
            throw new common_1.NotFoundException('Media not found or has been deleted.');
        return media;
    }
    assertDateRange(startDate, endDate) {
        if ((0, calendar_date_util_1.isInvalidDateRange)(startDate, endDate))
            throw new common_1.BadRequestException('End date must not be earlier than start date.');
    }
    async ensureActiveMediaType(id) {
        const mediaType = await this.prisma.mediaType.findFirst({
            where: { id, isDeleted: false },
            select: { id: true },
        });
        if (!mediaType)
            throw new common_1.NotFoundException('Media type not found or has been deleted.');
    }
    async resolveSharedMediaTypeIds(value, primaryMediaTypeId, existingValue = null) {
        const source = value === undefined ? (existingValue ?? null) : value;
        if (source === null)
            return null;
        const tokens = source.split(',');
        if (tokens.length === 0 ||
            tokens.some((token) => !/^\d+$/.test(token.trim())))
            throw new common_1.BadRequestException('sharedMediaTypeIds must be a comma-separated list of media type IDs.');
        const ids = [...new Set(tokens.map((token) => Number(token.trim())))];
        if (ids.some((id) => !Number.isSafeInteger(id) || id < 1))
            throw new common_1.BadRequestException('sharedMediaTypeIds must contain positive media type IDs.');
        if (ids.includes(primaryMediaTypeId))
            throw new common_1.BadRequestException('sharedMediaTypeIds must not include the primary mediaTypeId.');
        const mediaTypes = await this.prisma.mediaType.findMany({
            where: { id: { in: ids }, isDeleted: false },
            select: { id: true },
        });
        if (mediaTypes.length !== ids.length)
            throw new common_1.BadRequestException('Every sharedMediaTypeIds value must identify an active media type.');
        return ids.sort((left, right) => left - right).join(',');
    }
    async sharedMediaPlacementNames(media) {
        const ids = [
            ...new Set(media.flatMap((item) => [
                item.mediaTypeId,
                ...(item.sharedMediaTypeIds?.split(',').filter(Boolean).map(Number) ??
                    []),
            ])),
        ];
        if (ids.length === 0)
            return new Map();
        const mediaTypes = await this.prisma.mediaType.findMany({
            where: { id: { in: ids }, isDeleted: false },
            select: { id: true, nameEnglish: true },
        });
        return new Map(mediaTypes.map((type) => [type.id, type.nameEnglish]));
    }
    sharedMediaPlacements(sharedMediaTypeIds, placementNames) {
        return (sharedMediaTypeIds?.split(',').filter(Boolean).map(Number) ?? [])
            .filter((id) => placementNames.has(id))
            .map((id) => ({
            media_type_id: id,
            placement_name: placementNames.get(id),
        }));
    }
    async ensureActiveOrganization(id) {
        const organization = await this.prisma.organization.findFirst({
            where: { id, isDeleted: false },
            select: { id: true },
        });
        if (!organization)
            throw new common_1.NotFoundException('Organization not found or has been deleted.');
    }
    async resolveVisibility(dto, organizationId, existing) {
        const visibleToAll = dto.visible_to_all === undefined
            ? (existing?.visibleToAll ?? null)
            : (dto.visible_to_all ?? null);
        const roIds = dto.ro_ids === undefined
            ? (existing?.roIds ?? null)
            : this.normalizeRoIds(dto.ro_ids);
        const jnvIds = dto.jnv_ids === undefined
            ? (existing?.jnvIds ?? null)
            : this.normalizeJnvIds(dto.jnv_ids);
        if (visibleToAll === true && (roIds !== null || jnvIds !== null))
            throw new common_1.BadRequestException('visible_to_all=true cannot be combined with ro_ids or jnv_ids.');
        if (jnvIds !== null && roIds === null)
            throw new common_1.BadRequestException('jnv_ids requires at least one Regional Office in ro_ids.');
        if (roIds !== null) {
            await this.ensureHeadquartersSelectiveSharing(organizationId);
            await this.ensureRegionalOffices(roIds);
        }
        if (jnvIds !== null)
            await this.ensureJnvOrganizations(jnvIds, roIds);
        return { visibleToAll, roIds, jnvIds };
    }
    normalizeRoIds(value) {
        if (value === null)
            return null;
        const tokens = value.split(',');
        if (tokens.length === 0 ||
            tokens.some((token) => !/^\d+$/.test(token.trim())))
            throw new common_1.BadRequestException('ro_ids must be a comma-separated list of Regional Office IDs.');
        const ids = [...new Set(tokens.map((token) => Number(token.trim())))];
        if (ids.some((id) => !Number.isSafeInteger(id) || id < 1))
            throw new common_1.BadRequestException('ro_ids must contain positive Regional Office IDs.');
        return ids.join(',');
    }
    normalizeJnvIds(value) {
        if (value === null)
            return null;
        const tokens = value.split(',');
        if (tokens.length === 0 ||
            tokens.some((token) => !/^\d+$/.test(token.trim())))
            throw new common_1.BadRequestException('jnv_ids must be a comma-separated list of JNV organization IDs.');
        const ids = [...new Set(tokens.map((token) => Number(token.trim())))];
        if (ids.some((id) => !Number.isSafeInteger(id) || id < 1))
            throw new common_1.BadRequestException('jnv_ids must contain positive JNV organization IDs.');
        return ids.join(',');
    }
    async ensureHeadquartersSelectiveSharing(organizationId) {
        const organization = await this.prisma.organization.findFirst({
            where: {
                id: organizationId,
                isDeleted: false,
                organizationType: { code: 'HEADQUARTER', isActive: true },
            },
            select: { id: true },
        });
        if (!organization)
            throw new common_1.BadRequestException('Selective Regional Office sharing is available only for Headquarters media.');
    }
    async ensureRegionalOffices(roIds) {
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
            throw new common_1.BadRequestException('Every ro_ids value must identify an active Regional Office.');
    }
    async ensureJnvOrganizations(jnvIds, roIds) {
        const ids = jnvIds.split(',').map(Number);
        const regionalOfficeIds = roIds.split(',').map(Number);
        const organizations = await this.prisma.organization.findMany({
            where: {
                id: { in: ids },
                parentOrganizationId: { in: regionalOfficeIds },
                isDeleted: false,
                organizationType: { code: 'JNV', isActive: true },
            },
            select: { id: true },
        });
        if (organizations.length !== ids.length)
            throw new common_1.BadRequestException('Every jnv_ids value must identify an active JNV under one of the selected Regional Offices.');
    }
    async buildWhere(query, actor) {
        const where = {
            isDeleted: query.isDeleted ?? false,
            ...(query.mediaTypeId
                ? { OR: this.mediaTypeMatchWhere(query.mediaTypeId) }
                : {}),
            ...(query.is_active === undefined ? {} : { isActive: query.is_active }),
        };
        const visibilityWhere = await this.visibilityWhere(query, actor);
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
    async visibilityWhere(query, actor) {
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
        const headquartersSelectiveForRo = (roId) => this.headquartersSelectiveWhere(roId);
        const ownOrganization = {
            organizationId: actor.organizationId,
        };
        if (actor.role === client_1.Role.HEADQUARTER)
            return ownOrganization;
        if (actor.role === client_1.Role.NLI) {
            return { OR: [ownOrganization, headquartersShared] };
        }
        if (actor.role === client_1.Role.REGIONAL)
            return {
                OR: [
                    ownOrganization,
                    headquartersShared,
                    headquartersSelectiveForRo(actor.organizationId),
                ],
            };
        if (actor.role === client_1.Role.JNV) {
            const organization = await this.prisma.organization.findFirst({
                where: { id: actor.organizationId, isDeleted: false },
                select: { parentOrganizationId: true },
            });
            const selective = organization?.parentOrganizationId
                ? [
                    this.headquartersSelectiveWhere(organization.parentOrganizationId, actor.organizationId),
                ]
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
    exactRoIdsWhere(roId) {
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
    exactJnvIdsWhere(jnvId) {
        const token = String(jnvId);
        return {
            OR: [
                { jnvIds: token },
                { jnvIds: { startsWith: `${token},` } },
                { jnvIds: { endsWith: `,${token}` } },
                { jnvIds: { contains: `,${token},` } },
            ],
        };
    }
    mediaTypeMatchWhere(mediaTypeId) {
        const token = String(mediaTypeId);
        return [
            { mediaTypeId },
            { sharedMediaTypeIds: token },
            { sharedMediaTypeIds: { startsWith: `${token},` } },
            { sharedMediaTypeIds: { endsWith: `,${token}` } },
            { sharedMediaTypeIds: { contains: `,${token},` } },
        ];
    }
    async publicWhere(query, importantLink) {
        const today = (0, calendar_date_util_1.toCalendarDate)(new Date().toISOString().slice(0, 10));
        const dateConditions = [
            { OR: [{ startDate: null }, { startDate: { lte: today } }] },
            { OR: [{ endDate: null }, { endDate: { gte: today } }] },
        ];
        const where = {
            isDeleted: false,
            isActive: true,
            ...(query.media_type_id
                ? { OR: this.mediaTypeMatchWhere(query.media_type_id) }
                : {}),
            AND: dateConditions,
        };
        if (importantLink)
            dateConditions.push({ [importantLink]: true });
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
        if (!organization)
            throw new common_1.NotFoundException('Organization not found.');
        const own = { organizationId: organization.id };
        const headquartersShared = {
            visibleToAll: true,
            organization: { organizationType: { code: 'HEADQUARTER' } },
        };
        const publicVisibility = [
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
                publicVisibility.push(this.headquartersSelectiveWhere(organization.parentOrganizationId, organization.id));
            }
        }
        dateConditions.push({ OR: publicVisibility });
        return where;
    }
    headquartersSelectiveWhere(roId, jnvId) {
        const selectivelyVisible = {
            OR: [{ visibleToAll: false }, { visibleToAll: null }],
        };
        return {
            organization: { organizationType: { code: 'HEADQUARTER' } },
            AND: [
                selectivelyVisible,
                this.exactRoIdsWhere(roId),
                ...(jnvId === undefined ? [] : [this.exactJnvIdsWhere(jnvId)]),
            ],
        };
    }
    orderBy(query) {
        if (query.sort === 'display_order')
            return [
                { display_order: query.order },
                { createdAt: 'desc' },
                { id: 'desc' },
            ];
        if (query.sort === 'is_active')
            return { isActive: query.order };
        return { [query.sort]: query.order };
    }
    async createAuditLog(transaction, userId, action, media, previousMedia) {
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
    toResponse(media, placementNames) {
        return {
            id: media.id,
            sourceType: media.sourceType,
            externalUrl: media.externalUrl,
            organizationId: media.organizationId,
            mediaTypeId: media.mediaTypeId,
            mediaTypeName: placementNames.get(media.mediaTypeId) ?? null,
            sharedMediaTypeIds: media.sharedMediaTypeIds,
            shared_media_placements: this.sharedMediaPlacements(media.sharedMediaTypeIds, placementNames),
            titleEnglish: media.titleEnglish,
            titleHindi: media.titleHindi,
            descriptionEnglish: media.descriptionEnglish,
            descriptionHindi: media.descriptionHindi,
            originalFilename: media.originalFilename,
            mimeType: media.mimeType,
            extension: media.extension,
            fileSize: media.fileSize?.toString() ?? null,
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
            is_new: media.isNew,
            visible_to_all: media.visibleToAll,
            ro_ids: media.roIds,
            jnv_ids: media.jnvIds,
            important_link_1: media.importantLink1,
            important_link_2: media.importantLink2,
            important_link_3: media.importantLink3,
            start_date: (0, calendar_date_util_1.formatCalendarDate)(media.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(media.endDate),
            uploadedAt: media.uploadedAt,
            createdAt: media.createdAt,
            updatedAt: media.updatedAt,
            isDeleted: media.isDeleted,
        };
    }
    toAuditValues(media) {
        return {
            id: media.id,
            sourceType: media.sourceType,
            externalUrl: media.externalUrl,
            organizationId: media.organizationId,
            mediaTypeId: media.mediaTypeId,
            sharedMediaTypeIds: media.sharedMediaTypeIds,
            titleEnglish: media.titleEnglish,
            titleHindi: media.titleHindi,
            descriptionEnglish: media.descriptionEnglish,
            descriptionHindi: media.descriptionHindi,
            originalFilename: media.originalFilename,
            storedFilename: media.storedFilename,
            filePath: media.filePath,
            mimeType: media.mimeType,
            extension: media.extension,
            fileSize: media.fileSize?.toString() ?? null,
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
            isNew: media.isNew,
            visibleToAll: media.visibleToAll,
            roIds: media.roIds,
            jnvIds: media.jnvIds,
            importantLink1: media.importantLink1,
            importantLink2: media.importantLink2,
            importantLink3: media.importantLink3,
            start_date: (0, calendar_date_util_1.formatCalendarDate)(media.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(media.endDate),
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
    toPublicResponse(media, organizationId, placementNames = new Map()) {
        return {
            id: media.id,
            source_type: media.sourceType,
            external_url: media.externalUrl,
            media_type_id: media.mediaTypeId,
            media_type_name: placementNames.get(media.mediaTypeId) ?? null,
            shared_media_placements: this.sharedMediaPlacements(media.sharedMediaTypeIds, placementNames),
            title_english: media.titleEnglish,
            title_hindi: media.titleHindi,
            description_english: media.descriptionEnglish,
            description_hindi: media.descriptionHindi,
            is_new: media.isNew,
            start_date: (0, calendar_date_util_1.formatCalendarDate)(media.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(media.endDate),
            download_url: media.sourceType === client_1.MediaSourceType.FILE
                ? `/api/public/media/${media.id}/download${organizationId === undefined
                    ? ''
                    : `?organization_id=${organizationId}`}`
                : null,
            hindi_download_url: media.hindiFilePath
                ? `/api/public/media/${media.id}/download/hindi${organizationId === undefined
                    ? ''
                    : `?organization_id=${organizationId}`}`
                : null,
        };
    }
    mediaFileData(media) {
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
    hindiMediaFileData(media) {
        return {
            hindiOriginalFilename: media.hindiOriginalFilename,
            hindiStoredFilename: media.hindiStoredFilename,
            hindiFilePath: media.hindiFilePath,
            hindiMimeType: media.hindiMimeType,
            hindiExtension: media.hindiExtension,
            hindiFileSize: media.hindiFileSize,
            hindiChecksum: media.hindiChecksum,
            uploadedAt: media.uploadedAt,
        };
    }
    async checksum(filePath) {
        return (0, node_crypto_1.createHash)('sha256')
            .update(await (0, promises_1.readFile)(filePath))
            .digest('hex');
    }
    assertDownloadableFile(media) {
        if (media.sourceType !== client_1.MediaSourceType.FILE ||
            !media.filePath ||
            !media.originalFilename ||
            !media.mimeType)
            throw new common_1.BadRequestException('This media record contains an external link and has no downloadable file.');
    }
    async hindiFileData(file) {
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
    sanitizeFilename(filename) {
        return (0, node_path_1.basename)(filename)
            .replace(/[\x00-\x1f\\/:*?"<>|]/g, '_')
            .slice(0, 255);
    }
    extensionOf(filename) {
        return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
    }
    toStoredPath(filePath) {
        return (0, node_path_1.relative)(process.cwd(), filePath);
    }
    absolutePath(filePath) {
        const absolutePath = (0, node_path_1.resolve)(process.cwd(), filePath);
        if (!absolutePath.startsWith(`${media_storage_1.UPLOADS_ROOT}/`))
            throw new common_1.NotFoundException('Document file not found.');
        return absolutePath;
    }
    async removePhysicalFile(filePath) {
        await (0, promises_1.unlink)(this.absolutePath(filePath));
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        organization_ownership_service_1.OrganizationOwnershipService])
], MediaService);
//# sourceMappingURL=media.service.js.map