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
exports.MediaTypesService = void 0;
const common_1 = require("@nestjs/common");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
let MediaTypesService = class MediaTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, actor) {
        await this.ensureNameIsUnique(dto.nameEnglish);
        const mediaType = await this.prisma.$transaction(async (transaction) => {
            const createdMediaType = await transaction.mediaType.create({
                data: { ...dto, createdById: actor.id, updatedById: actor.id },
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'MEDIA_TYPE',
                    entity: 'MEDIA_TYPE',
                    entityId: createdMediaType.id,
                    action: 'CREATE',
                    newValues: this.toAuditValues(createdMediaType),
                },
            });
            return createdMediaType;
        });
        return this.toResponse(mediaType);
    }
    async findAll(query) {
        const { page, limit, search, sort, order, isDeleted } = query;
        const where = this.buildWhere(search, isDeleted);
        const orderBy = sort === 'display_order'
            ? [{ display_order: order }, { createdAt: 'desc' }, { id: 'desc' }]
            : { [sort]: order };
        const [mediaTypes, totalItems] = await this.prisma.$transaction([
            this.prisma.mediaType.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.mediaType.count({ where }),
        ]);
        return {
            items: mediaTypes.map((mediaType) => this.toResponse(mediaType)),
            meta: pagination_util_1.PaginationUtil.buildMeta(page, limit, totalItems),
        };
    }
    async findOne(id) {
        return this.toResponse(await this.findActiveMediaType(id));
    }
    async update(id, dto, actor) {
        const existingMediaType = await this.findActiveMediaType(id);
        if (dto.nameEnglish !== undefined)
            await this.ensureNameIsUnique(dto.nameEnglish, id);
        const mediaType = await this.prisma.$transaction(async (transaction) => {
            const updatedMediaType = await transaction.mediaType.update({
                where: { id },
                data: { ...dto, updatedById: actor.id },
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'MEDIA_TYPE',
                    entity: 'MEDIA_TYPE',
                    entityId: id,
                    action: 'UPDATE',
                    previousValues: this.toAuditValues(existingMediaType),
                    newValues: this.toAuditValues(updatedMediaType),
                },
            });
            return updatedMediaType;
        });
        return this.toResponse(mediaType);
    }
    async remove(id, actor) {
        const mediaType = await this.prisma.$transaction(async (transaction) => {
            const existingMediaType = await transaction.mediaType.findFirst({
                where: { id, isDeleted: false },
            });
            if (!existingMediaType)
                throw new common_1.NotFoundException('Media type not found or has already been deleted.');
            const mediaCount = await transaction.media.count({
                where: { mediaTypeId: id },
            });
            const menuCount = await transaction.menu.count({
                where: { mediaTypeId: id, isDeleted: false },
            });
            if (mediaCount > 0 || menuCount > 0)
                throw new common_1.ConflictException('Media type cannot be deleted because it is referenced by media records or menus.');
            const deletedMediaType = await transaction.mediaType.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedById: actor.id,
                    updatedById: actor.id,
                },
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'MEDIA_TYPE',
                    entity: 'MEDIA_TYPE',
                    entityId: id,
                    action: 'DELETE',
                    previousValues: this.toAuditValues(existingMediaType),
                    newValues: this.toAuditValues(deletedMediaType),
                },
            });
            return deletedMediaType;
        });
        return this.toResponse(mediaType);
    }
    async restore(id, actor) {
        const mediaType = await this.prisma.$transaction(async (transaction) => {
            const existingMediaType = await transaction.mediaType.findFirst({
                where: { id, isDeleted: true },
            });
            if (!existingMediaType)
                throw new common_1.NotFoundException('Deleted media type not found.');
            const restoredMediaType = await transaction.mediaType.update({
                where: { id },
                data: {
                    isDeleted: false,
                    deletedAt: null,
                    deletedById: null,
                    updatedById: actor.id,
                },
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'MEDIA_TYPE',
                    entity: 'MEDIA_TYPE',
                    entityId: id,
                    action: 'RESTORE',
                    previousValues: this.toAuditValues(existingMediaType),
                    newValues: this.toAuditValues(restoredMediaType),
                },
            });
            return restoredMediaType;
        });
        return this.toResponse(mediaType);
    }
    async findActiveMediaType(id) {
        const mediaType = await this.prisma.mediaType.findFirst({
            where: { id, isDeleted: false },
        });
        if (!mediaType)
            throw new common_1.NotFoundException('Media type not found or has been deleted.');
        return mediaType;
    }
    async ensureNameIsUnique(name, excludedId) {
        const duplicate = await this.prisma.mediaType.findFirst({
            where: {
                ...(excludedId ? { id: { not: excludedId } } : {}),
                nameEnglish: { equals: name, mode: 'insensitive' },
            },
            select: { id: true },
        });
        if (duplicate)
            throw new common_1.ConflictException('A media type with the same name already exists.');
    }
    buildWhere(search, isDeleted) {
        const where = { isDeleted: isDeleted ?? false };
        if (search?.trim()) {
            where.OR = [
                { nameEnglish: { contains: search.trim(), mode: 'insensitive' } },
                { nameHindi: { contains: search.trim(), mode: 'insensitive' } },
                {
                    descriptionEnglish: { contains: search.trim(), mode: 'insensitive' },
                },
                { descriptionHindi: { contains: search.trim(), mode: 'insensitive' } },
            ];
        }
        return where;
    }
    toResponse(mediaType) {
        return {
            id: mediaType.id,
            nameEnglish: mediaType.nameEnglish,
            nameHindi: mediaType.nameHindi,
            descriptionEnglish: mediaType.descriptionEnglish,
            descriptionHindi: mediaType.descriptionHindi,
            display_order: mediaType.display_order,
            createdAt: mediaType.createdAt,
            updatedAt: mediaType.updatedAt,
        };
    }
    toAuditValues(mediaType) {
        return {
            id: mediaType.id,
            nameEnglish: mediaType.nameEnglish,
            nameHindi: mediaType.nameHindi,
            descriptionEnglish: mediaType.descriptionEnglish,
            descriptionHindi: mediaType.descriptionHindi,
            display_order: mediaType.display_order,
            createdAt: mediaType.createdAt.toISOString(),
            updatedAt: mediaType.updatedAt.toISOString(),
            createdById: mediaType.createdById,
            updatedById: mediaType.updatedById,
            isDeleted: mediaType.isDeleted,
            deletedAt: mediaType.deletedAt?.toISOString() ?? null,
            deletedById: mediaType.deletedById,
        };
    }
};
exports.MediaTypesService = MediaTypesService;
exports.MediaTypesService = MediaTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaTypesService);
//# sourceMappingURL=media-types.service.js.map