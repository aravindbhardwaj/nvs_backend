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
exports.ContentTypesService = void 0;
const common_1 = require("@nestjs/common");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
let ContentTypesService = class ContentTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, actor) {
        await this.ensureNameIsUnique(dto.nameEnglish);
        const contentType = await this.prisma.$transaction(async (transaction) => {
            const createdContentType = await transaction.contentType.create({
                data: { ...dto, createdById: actor.id, updatedById: actor.id },
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'CONTENT_TYPE',
                    entity: 'CONTENT_TYPE',
                    entityId: createdContentType.id,
                    action: 'CREATE',
                    newValues: this.toAuditValues(createdContentType),
                },
            });
            return createdContentType;
        });
        return this.toResponse(contentType);
    }
    async findAll(query) {
        const { page, limit, search, sort, order, isDeleted } = query;
        const where = this.buildWhere(search, isDeleted);
        const orderBy = sort === 'display_order'
            ? [{ display_order: order }, { createdAt: 'desc' }, { id: 'desc' }]
            : { [sort]: order };
        const [contentTypes, totalItems] = await this.prisma.$transaction([
            this.prisma.contentType.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.contentType.count({ where }),
        ]);
        return {
            items: contentTypes.map((contentType) => this.toResponse(contentType)),
            meta: pagination_util_1.PaginationUtil.buildMeta(page, limit, totalItems),
        };
    }
    async findOne(id) {
        return this.toResponse(await this.findActiveContentType(id));
    }
    async update(id, dto, actor) {
        const existingContentType = await this.findActiveContentType(id);
        if (dto.nameEnglish !== undefined)
            await this.ensureNameIsUnique(dto.nameEnglish, id);
        const contentType = await this.prisma.$transaction(async (transaction) => {
            const updatedContentType = await transaction.contentType.update({
                where: { id },
                data: { ...dto, updatedById: actor.id },
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'CONTENT_TYPE',
                    entity: 'CONTENT_TYPE',
                    entityId: id,
                    action: 'UPDATE',
                    previousValues: this.toAuditValues(existingContentType),
                    newValues: this.toAuditValues(updatedContentType),
                },
            });
            return updatedContentType;
        });
        return this.toResponse(contentType);
    }
    async remove(id, actor) {
        const contentType = await this.prisma.$transaction(async (transaction) => {
            const existingContentType = await transaction.contentType.findFirst({
                where: { id, isDeleted: false },
            });
            if (!existingContentType)
                throw new common_1.NotFoundException('Content type not found or has already been deleted.');
            const pageCount = await transaction.page.count({
                where: { contentTypeId: id },
            });
            const menuCount = await transaction.menu.count({
                where: { contentTypeId: id, isDeleted: false },
            });
            if (pageCount > 0 || menuCount > 0)
                throw new common_1.ConflictException('Content type cannot be deleted because it is referenced by pages or menus.');
            const deletedContentType = await transaction.contentType.update({
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
                    module: 'CONTENT_TYPE',
                    entity: 'CONTENT_TYPE',
                    entityId: id,
                    action: 'DELETE',
                    previousValues: this.toAuditValues(existingContentType),
                    newValues: this.toAuditValues(deletedContentType),
                },
            });
            return deletedContentType;
        });
        return this.toResponse(contentType);
    }
    async restore(id, actor) {
        const contentType = await this.prisma.$transaction(async (transaction) => {
            const existingContentType = await transaction.contentType.findFirst({
                where: { id, isDeleted: true },
            });
            if (!existingContentType)
                throw new common_1.NotFoundException('Deleted content type not found.');
            const restoredContentType = await transaction.contentType.update({
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
                    module: 'CONTENT_TYPE',
                    entity: 'CONTENT_TYPE',
                    entityId: id,
                    action: 'RESTORE',
                    previousValues: this.toAuditValues(existingContentType),
                    newValues: this.toAuditValues(restoredContentType),
                },
            });
            return restoredContentType;
        });
        return this.toResponse(contentType);
    }
    async findActiveContentType(id) {
        const contentType = await this.prisma.contentType.findFirst({
            where: { id, isDeleted: false },
        });
        if (!contentType)
            throw new common_1.NotFoundException('Content type not found or has been deleted.');
        return contentType;
    }
    async ensureNameIsUnique(name, excludedId) {
        const duplicate = await this.prisma.contentType.findFirst({
            where: {
                ...(excludedId ? { id: { not: excludedId } } : {}),
                nameEnglish: { equals: name, mode: 'insensitive' },
            },
            select: { id: true },
        });
        if (duplicate)
            throw new common_1.ConflictException('A content type with the same name already exists.');
    }
    buildWhere(search, isDeleted) {
        const where = {
            isDeleted: isDeleted ?? false,
        };
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
    toResponse(contentType) {
        return {
            id: contentType.id,
            nameEnglish: contentType.nameEnglish,
            nameHindi: contentType.nameHindi,
            descriptionEnglish: contentType.descriptionEnglish,
            descriptionHindi: contentType.descriptionHindi,
            display_order: contentType.display_order,
            createdAt: contentType.createdAt,
            updatedAt: contentType.updatedAt,
        };
    }
    toAuditValues(contentType) {
        return {
            id: contentType.id,
            nameEnglish: contentType.nameEnglish,
            nameHindi: contentType.nameHindi,
            descriptionEnglish: contentType.descriptionEnglish,
            descriptionHindi: contentType.descriptionHindi,
            display_order: contentType.display_order,
            createdAt: contentType.createdAt.toISOString(),
            updatedAt: contentType.updatedAt.toISOString(),
            createdById: contentType.createdById,
            updatedById: contentType.updatedById,
            isDeleted: contentType.isDeleted,
            deletedAt: contentType.deletedAt?.toISOString() ?? null,
            deletedById: contentType.deletedById,
        };
    }
};
exports.ContentTypesService = ContentTypesService;
exports.ContentTypesService = ContentTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentTypesService);
//# sourceMappingURL=content-types.service.js.map