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
exports.LeadershipService = void 0;
const common_1 = require("@nestjs/common");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const prisma_service_1 = require("../prisma/prisma.service");
const leadership_storage_1 = require("./leadership.storage");
let LeadershipService = class LeadershipService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, file, actor) {
        await (0, leadership_storage_1.validateLeaderImage)(file);
        const leader = await this.prisma.leader.create({
            data: {
                leaderNameEnglish: dto.leaderNameEnglish,
                leaderNameHindi: dto.leaderNameHindi,
                leaderDesignationEnglish: dto.leaderDesignationEnglish,
                leaderDesignationHindi: dto.leaderDesignationHindi,
                storedFilename: file.filename,
                imagePath: this.relativePath(file.path),
                mimeType: file.mimetype,
                extension: (0, node_path_1.extname)(file.filename).slice(1).toLowerCase(),
                fileSize: BigInt(file.size),
                display_order: dto.display_order ?? 0,
                isActive: dto.isActive ?? true,
                createdById: actor.id,
                updatedById: actor.id,
            },
        });
        return this.toResponse(leader);
    }
    async findAll(query) {
        const where = {
            isDeleted: query.isDeleted ?? false,
            ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
            ...(query.search
                ? {
                    OR: [
                        {
                            leaderNameEnglish: {
                                contains: query.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            leaderNameHindi: {
                                contains: query.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            leaderDesignationEnglish: {
                                contains: query.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            leaderDesignationHindi: {
                                contains: query.search,
                                mode: 'insensitive',
                            },
                        },
                    ],
                }
                : {}),
        };
        const [items, totalItems] = await this.prisma.$transaction([
            this.prisma.leader.findMany({
                where,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: query.sort === 'display_order'
                    ? [
                        { display_order: query.order },
                        { createdAt: 'desc' },
                        { id: 'desc' },
                    ]
                    : { [query.sort]: query.order },
            }),
            this.prisma.leader.count({ where }),
        ]);
        return {
            items: items.map((item) => this.toResponse(item)),
            pagination: {
                page: query.page,
                limit: query.limit,
                totalItems,
                totalPages: Math.ceil(totalItems / query.limit),
            },
        };
    }
    async findOne(id) {
        return this.toResponse(await this.findExisting(id));
    }
    async update(id, dto, actor) {
        await this.findExisting(id);
        const leader = await this.prisma.leader.update({
            where: { id },
            data: { ...dto, updatedById: actor.id },
        });
        return this.toResponse(leader);
    }
    async replaceImage(id, file, actor) {
        await (0, leadership_storage_1.validateLeaderImage)(file);
        const existing = await this.findExisting(id);
        const leader = await this.prisma.leader.update({
            where: { id },
            data: {
                storedFilename: file.filename,
                imagePath: this.relativePath(file.path),
                mimeType: file.mimetype,
                extension: (0, node_path_1.extname)(file.filename).slice(1).toLowerCase(),
                fileSize: BigInt(file.size),
                updatedById: actor.id,
            },
        });
        await this.deleteStoredFile(existing.imagePath);
        return this.toResponse(leader);
    }
    async setActive(id, isActive, actor) {
        await this.findExisting(id);
        return this.toResponse(await this.prisma.leader.update({
            where: { id },
            data: { isActive, updatedById: actor.id },
        }));
    }
    async reorder(dto, actor) {
        const ids = dto.items.map((item) => item.id);
        const count = await this.prisma.leader.count({
            where: { id: { in: ids }, isDeleted: false },
        });
        if (count !== new Set(ids).size)
            throw new common_1.NotFoundException('One or more leaders were not found.');
        await this.prisma.$transaction(dto.items.map((item) => this.prisma.leader.update({
            where: { id: item.id },
            data: { display_order: item.display_order, updatedById: actor.id },
        })));
    }
    async remove(id, actor) {
        await this.findExisting(id);
        return this.toResponse(await this.prisma.leader.update({
            where: { id },
            data: {
                isDeleted: true,
                isActive: false,
                deletedAt: new Date(),
                deletedById: actor.id,
                updatedById: actor.id,
            },
        }));
    }
    async findPublic() {
        const leaders = await this.prisma.leader.findMany({
            where: { isActive: true, isDeleted: false },
            orderBy: [
                { display_order: 'asc' },
                { createdAt: 'desc' },
                { id: 'desc' },
            ],
        });
        return leaders.map((leader) => this.toPublicResponse(leader));
    }
    async findPublicOne(id) {
        const leader = await this.prisma.leader.findFirst({
            where: { id, isActive: true, isDeleted: false },
        });
        if (!leader)
            throw new common_1.NotFoundException('Leader not found.');
        return this.toPublicResponse(leader);
    }
    async imageStream(id, publicOnly = false) {
        const leader = await this.prisma.leader.findFirst({
            where: {
                id,
                isDeleted: false,
                ...(publicOnly ? { isActive: true } : {}),
            },
        });
        if (!leader)
            throw new common_1.NotFoundException('Leader not found.');
        return {
            stream: (0, node_fs_1.createReadStream)(this.absolutePath(leader.imagePath)),
            mimeType: leader.mimeType,
        };
    }
    async cleanupUploadedFile(file) {
        await (0, promises_1.unlink)(file.path).catch(() => undefined);
    }
    async findExisting(id) {
        const leader = await this.prisma.leader.findFirst({
            where: { id, isDeleted: false },
        });
        if (!leader)
            throw new common_1.NotFoundException('Leader not found.');
        return leader;
    }
    relativePath(path) {
        return (0, node_path_1.relative)(process.cwd(), path).split(node_path_1.sep).join('/');
    }
    absolutePath(path) {
        return (0, node_path_1.resolve)(process.cwd(), path);
    }
    async deleteStoredFile(path) {
        const absolute = this.absolutePath(path);
        if (absolute.startsWith((0, node_path_1.resolve)(leadership_storage_1.LEADERSHIP_UPLOADS_ROOT) + node_path_1.sep))
            await (0, promises_1.unlink)(absolute).catch(() => undefined);
    }
    toResponse(leader) {
        return {
            id: leader.id,
            leaderNameEnglish: leader.leaderNameEnglish,
            leaderNameHindi: leader.leaderNameHindi,
            leaderDesignationEnglish: leader.leaderDesignationEnglish,
            leaderDesignationHindi: leader.leaderDesignationHindi,
            pictureUrl: `/api/leadership/${leader.id}/image`,
            mimeType: leader.mimeType,
            extension: leader.extension,
            fileSize: leader.fileSize.toString(),
            display_order: leader.display_order,
            isActive: leader.isActive,
            createdAt: leader.createdAt,
            updatedAt: leader.updatedAt,
            isDeleted: leader.isDeleted,
        };
    }
    toPublicResponse(leader) {
        return {
            id: leader.id,
            leader_name_english: leader.leaderNameEnglish,
            leader_name_hindi: leader.leaderNameHindi,
            leader_designation_english: leader.leaderDesignationEnglish,
            leader_designation_hindi: leader.leaderDesignationHindi,
            picture_url: `/api/public/leadership/${leader.id}/image`,
            display_order: leader.display_order,
        };
    }
};
exports.LeadershipService = LeadershipService;
exports.LeadershipService = LeadershipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadershipService);
//# sourceMappingURL=leadership.service.js.map