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
exports.ModalsService = void 0;
const common_1 = require("@nestjs/common");
const pagination_util_1 = require("../common/utils/pagination.util");
const calendar_date_util_1 = require("../common/utils/calendar-date.util");
const prisma_service_1 = require("../prisma/prisma.service");
let ModalsService = class ModalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, actor) {
        this.assertDisplayDates(dto.start_date, dto.end_date);
        const modal = await this.prisma.$transaction(async (transaction) => {
            const created = await transaction.modal.create({
                data: {
                    textEnglish: dto.text_english,
                    textHindi: dto.text_hindi,
                    link: dto.link,
                    display_order: dto.display_order ?? 0,
                    isActive: dto.isActive ?? true,
                    startDate: dto.start_date ? (0, calendar_date_util_1.toCalendarDate)(dto.start_date) : null,
                    endDate: dto.end_date ? (0, calendar_date_util_1.toCalendarDate)(dto.end_date) : null,
                    createdById: actor.id,
                    updatedById: actor.id,
                },
            });
            await this.createAuditLog(transaction, actor.id, 'CREATE', created);
            return created;
        });
        return this.toResponse(modal);
    }
    async findAll(query) {
        const where = {
            isDeleted: query.isDeleted ?? false,
            ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
            ...(query.search?.trim()
                ? {
                    OR: [
                        {
                            textEnglish: {
                                contains: query.search.trim(),
                                mode: 'insensitive',
                            },
                        },
                        {
                            textHindi: {
                                contains: query.search.trim(),
                                mode: 'insensitive',
                            },
                        },
                        {
                            link: {
                                contains: query.search.trim(),
                                mode: 'insensitive',
                            },
                        },
                    ],
                }
                : {}),
        };
        const [modals, totalItems] = await this.prisma.$transaction([
            this.prisma.modal.findMany({
                where,
                orderBy: query.sort === 'display_order'
                    ? [
                        { display_order: query.order },
                        { createdAt: 'desc' },
                        { id: 'desc' },
                    ]
                    : { [this.sortField(query.sort)]: query.order },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.modal.count({ where }),
        ]);
        return {
            items: modals.map((modal) => this.toResponse(modal)),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findOne(id) {
        return this.toResponse(await this.findExisting(id));
    }
    async update(id, dto, actor) {
        const existing = await this.findExisting(id);
        this.assertDisplayDates(dto.start_date === undefined
            ? (0, calendar_date_util_1.formatCalendarDate)(existing.startDate)
            : dto.start_date, dto.end_date === undefined
            ? (0, calendar_date_util_1.formatCalendarDate)(existing.endDate)
            : dto.end_date);
        const modal = await this.prisma.$transaction(async (transaction) => {
            const updated = await transaction.modal.update({
                where: { id },
                data: {
                    ...(dto.text_english === undefined
                        ? {}
                        : { textEnglish: dto.text_english }),
                    ...(dto.text_hindi === undefined
                        ? {}
                        : { textHindi: dto.text_hindi }),
                    ...(dto.link === undefined ? {} : { link: dto.link }),
                    ...(dto.display_order === undefined
                        ? {}
                        : { display_order: dto.display_order }),
                    ...(dto.isActive === undefined ? {} : { isActive: dto.isActive }),
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
            await this.createAuditLog(transaction, actor.id, 'UPDATE', updated, existing);
            return updated;
        });
        return this.toResponse(modal);
    }
    async setActive(id, isActive, actor) {
        const existing = await this.findExisting(id);
        const modal = await this.prisma.$transaction(async (transaction) => {
            const updated = await transaction.modal.update({
                where: { id },
                data: { isActive, updatedById: actor.id },
            });
            await this.createAuditLog(transaction, actor.id, isActive ? 'ACTIVATE' : 'DEACTIVATE', updated, existing);
            return updated;
        });
        return this.toResponse(modal);
    }
    async reorder(dto, actor) {
        const ids = dto.items.map((item) => item.id);
        if (new Set(ids).size !== ids.length) {
            throw new common_1.NotFoundException('One or more modals were not found.');
        }
        await this.prisma.$transaction(async (transaction) => {
            const existing = await transaction.modal.findMany({
                where: { id: { in: ids }, isDeleted: false },
            });
            if (existing.length !== ids.length) {
                throw new common_1.NotFoundException('One or more modals were not found.');
            }
            for (const item of dto.items) {
                const previous = existing.find((modal) => modal.id === item.id);
                const updated = await transaction.modal.update({
                    where: { id: item.id },
                    data: { display_order: item.display_order, updatedById: actor.id },
                });
                await this.createAuditLog(transaction, actor.id, 'REORDER', updated, previous);
            }
        });
    }
    async remove(id, actor) {
        const existing = await this.findExisting(id);
        const modal = await this.prisma.$transaction(async (transaction) => {
            const deleted = await transaction.modal.update({
                where: { id },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: new Date(),
                    deletedById: actor.id,
                    updatedById: actor.id,
                },
            });
            await this.createAuditLog(transaction, actor.id, 'DELETE', deleted, existing);
            return deleted;
        });
        return this.toResponse(modal);
    }
    async findPublic(query) {
        const where = {
            isActive: true,
            isDeleted: false,
            AND: [
                { OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
                { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
            ],
            ...(query.search?.trim()
                ? {
                    OR: [
                        {
                            textEnglish: {
                                contains: query.search.trim(),
                                mode: 'insensitive',
                            },
                        },
                        {
                            textHindi: {
                                contains: query.search.trim(),
                                mode: 'insensitive',
                            },
                        },
                    ],
                }
                : {}),
        };
        const [modals, totalItems] = await this.prisma.$transaction([
            this.prisma.modal.findMany({
                where,
                orderBy: [
                    { display_order: 'asc' },
                    { createdAt: 'desc' },
                    { id: 'desc' },
                ],
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.modal.count({ where }),
        ]);
        return {
            items: modals.map((modal) => this.toPublicResponse(modal)),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findExisting(id) {
        const modal = await this.prisma.modal.findFirst({
            where: { id, isDeleted: false },
        });
        if (!modal)
            throw new common_1.NotFoundException('Modal not found or deleted.');
        return modal;
    }
    async createAuditLog(transaction, userId, action, modal, previousModal) {
        await transaction.auditLog.create({
            data: {
                userId,
                module: 'MODAL',
                entity: 'MODAL',
                entityId: modal.id,
                action,
                ...(previousModal
                    ? { previousValues: this.toAuditValues(previousModal) }
                    : {}),
                newValues: this.toAuditValues(modal),
            },
        });
    }
    toResponse(modal) {
        return {
            id: modal.id,
            text_english: modal.textEnglish,
            text_hindi: modal.textHindi,
            link: modal.link,
            display_order: modal.display_order,
            isActive: modal.isActive,
            start_date: (0, calendar_date_util_1.formatCalendarDate)(modal.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(modal.endDate),
            createdAt: modal.createdAt,
            updatedAt: modal.updatedAt,
            isDeleted: modal.isDeleted,
        };
    }
    toPublicResponse(modal) {
        return {
            id: modal.id,
            text_english: modal.textEnglish,
            text_hindi: modal.textHindi,
            link: modal.link,
            display_order: modal.display_order,
            start_date: (0, calendar_date_util_1.formatCalendarDate)(modal.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(modal.endDate),
        };
    }
    toAuditValues(modal) {
        return {
            id: modal.id,
            text_english: modal.textEnglish,
            text_hindi: modal.textHindi,
            link: modal.link,
            display_order: modal.display_order,
            isActive: modal.isActive,
            start_date: (0, calendar_date_util_1.formatCalendarDate)(modal.startDate),
            end_date: (0, calendar_date_util_1.formatCalendarDate)(modal.endDate),
            isDeleted: modal.isDeleted,
            deletedAt: modal.deletedAt?.toISOString() ?? null,
        };
    }
    sortField(sort) {
        if (sort === 'text_english')
            return 'textEnglish';
        if (sort === 'text_hindi')
            return 'textHindi';
        if (sort === 'start_date')
            return 'startDate';
        if (sort === 'end_date')
            return 'endDate';
        return sort;
    }
    assertDisplayDates(startDate, endDate) {
        if ((0, calendar_date_util_1.isInvalidDateRange)(startDate, endDate)) {
            throw new common_1.BadRequestException('End date must not be earlier than start date.');
        }
    }
};
exports.ModalsService = ModalsService;
exports.ModalsService = ModalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModalsService);
//# sourceMappingURL=modals.service.js.map