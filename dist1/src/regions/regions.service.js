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
exports.RegionsService = void 0;
const common_1 = require("@nestjs/common");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
let RegionsService = class RegionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, actor) {
        await this.ensureValuesAreUnique(dto.regionName, dto.regionCode);
        const stateIds = await this.normalizeAndValidateStateIds(dto.state_ids);
        const region = await this.prisma.$transaction(async (transaction) => {
            const createdRegion = await transaction.region.create({
                data: {
                    regionName: dto.regionName,
                    regionCode: dto.regionCode,
                    stateIds,
                    createdById: actor.id,
                    updatedById: actor.id,
                },
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'REGION',
                    entity: 'REGION',
                    entityId: createdRegion.id,
                    action: 'CREATE',
                    newValues: this.toAuditValues(createdRegion),
                },
            });
            return createdRegion;
        });
        return this.toResponse(region);
    }
    async findAll(query) {
        const { page, limit, search, sort, order, isDeleted } = query;
        const where = this.buildWhere(search, isDeleted);
        const orderBy = { [sort]: order };
        const [regions, totalItems] = await this.prisma.$transaction([
            this.prisma.region.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.region.count({ where }),
        ]);
        return {
            items: regions.map((region) => this.toResponse(region)),
            meta: pagination_util_1.PaginationUtil.buildMeta(page, limit, totalItems),
        };
    }
    async findOne(id) {
        const region = await this.prisma.region.findFirst({
            where: { id, isDeleted: false },
        });
        if (!region) {
            throw new common_1.NotFoundException('Region not found.');
        }
        return this.toResponse(region);
    }
    async update(id, dto, actor) {
        const existingRegion = await this.findActiveRegion(id);
        await this.ensureValuesAreUnique(dto.regionName, dto.regionCode, id);
        const stateIds = dto.state_ids !== undefined
            ? await this.normalizeAndValidateStateIds(dto.state_ids)
            : undefined;
        const region = await this.prisma.$transaction(async (transaction) => {
            const updatedRegion = await transaction.region.update({
                where: { id },
                data: {
                    regionName: dto.regionName,
                    regionCode: dto.regionCode,
                    ...(stateIds !== undefined ? { stateIds } : {}),
                    updatedById: actor.id,
                },
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'REGION',
                    entity: 'REGION',
                    entityId: id,
                    action: 'UPDATE',
                    previousValues: this.toAuditValues(existingRegion),
                    newValues: this.toAuditValues(updatedRegion),
                },
            });
            return updatedRegion;
        });
        return this.toResponse(region);
    }
    async remove(id, actor) {
        const region = await this.prisma.$transaction(async (transaction) => {
            const existingRegion = await transaction.region.findFirst({
                where: { id, isDeleted: false },
            });
            if (!existingRegion) {
                throw new common_1.NotFoundException('Region not found or has already been deleted.');
            }
            const organizationCount = await transaction.organization.count({
                where: { regionId: id },
            });
            if (organizationCount > 0) {
                throw new common_1.ConflictException('Region cannot be deleted because it is referenced by organizations.');
            }
            const deletedRegion = await transaction.region.update({
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
                    module: 'REGION',
                    entity: 'REGION',
                    entityId: id,
                    action: 'DELETE',
                    previousValues: this.toAuditValues(existingRegion),
                    newValues: this.toAuditValues(deletedRegion),
                },
            });
            return deletedRegion;
        });
        return this.toResponse(region);
    }
    async restore(id, actor) {
        const region = await this.prisma.$transaction(async (transaction) => {
            const existingRegion = await transaction.region.findFirst({
                where: { id, isDeleted: true },
            });
            if (!existingRegion) {
                throw new common_1.NotFoundException('Deleted region not found.');
            }
            const restoredRegion = await transaction.region.update({
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
                    module: 'REGION',
                    entity: 'REGION',
                    entityId: id,
                    action: 'RESTORE',
                    previousValues: this.toAuditValues(existingRegion),
                    newValues: this.toAuditValues(restoredRegion),
                },
            });
            return restoredRegion;
        });
        return this.toResponse(region);
    }
    async findActiveRegion(id) {
        const region = await this.prisma.region.findFirst({
            where: { id, isDeleted: false },
        });
        if (!region) {
            throw new common_1.NotFoundException('Region not found or has been deleted.');
        }
        return region;
    }
    async ensureValuesAreUnique(regionName, regionCode, excludedId) {
        const duplicate = await this.prisma.region.findFirst({
            where: {
                ...(excludedId ? { id: { not: excludedId } } : {}),
                OR: [{ regionName }, { regionCode }],
            },
            select: { id: true },
        });
        if (duplicate) {
            throw new common_1.ConflictException('A region with the same name or code already exists.');
        }
    }
    buildWhere(search, isDeleted) {
        const where = {
            isDeleted: isDeleted ?? false,
        };
        if (search?.trim()) {
            where.OR = [
                { regionName: { contains: search.trim(), mode: 'insensitive' } },
                { regionCode: { contains: search.trim(), mode: 'insensitive' } },
            ];
        }
        return where;
    }
    async normalizeAndValidateStateIds(stateIds) {
        const entries = stateIds.split(',').map((value) => value.trim());
        if (entries.length === 0 ||
            entries.some((value) => !/^[1-9]\d*$/.test(value))) {
            throw new common_1.BadRequestException('state_ids must be a comma-separated list of valid State IDs.');
        }
        const ids = [...new Set(entries.map(Number))];
        const stateCount = await this.prisma.state.count({
            where: { id: { in: ids }, isDeleted: false },
        });
        if (stateCount !== ids.length) {
            throw new common_1.NotFoundException('One or more State IDs were not found.');
        }
        return ids.join(',');
    }
    toResponse(region) {
        return {
            id: region.id,
            regionName: region.regionName,
            regionCode: region.regionCode,
            state_ids: region.stateIds,
            createdAt: region.createdAt,
            updatedAt: region.updatedAt,
        };
    }
    toAuditValues(region) {
        return {
            id: region.id,
            regionName: region.regionName,
            regionCode: region.regionCode,
            state_ids: region.stateIds,
            createdAt: region.createdAt.toISOString(),
            updatedAt: region.updatedAt.toISOString(),
            createdById: region.createdById,
            updatedById: region.updatedById,
            isDeleted: region.isDeleted,
            deletedAt: region.deletedAt?.toISOString() ?? null,
            deletedById: region.deletedById,
        };
    }
};
exports.RegionsService = RegionsService;
exports.RegionsService = RegionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegionsService);
//# sourceMappingURL=regions.service.js.map