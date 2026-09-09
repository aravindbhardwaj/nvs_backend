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
exports.JnvPrincipalsService = void 0;
const common_1 = require("@nestjs/common");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const prisma_service_1 = require("../prisma/prisma.service");
const jnv_principals_storage_1 = require("./jnv-principals.storage");
let JnvPrincipalsService = class JnvPrincipalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(organizationId, dto, file, actor) {
        await this.ensureJnv(organizationId);
        if (file)
            await (0, jnv_principals_storage_1.validateJnvPrincipalImage)(file);
        this.ensureTenure(dto.joinedAt, dto.relievedAt);
        const joinedAt = dto.joinedAt ?? new Date();
        const principal = await this.prisma.$transaction(async (transaction) => {
            if (!dto.relievedAt) {
                const current = await transaction.jnvPrincipal.findFirst({
                    where: { organizationId, relievedAt: null, isDeleted: false },
                });
                if (current && current.joinedAt > joinedAt) {
                    throw new common_1.BadRequestException('joinedAt cannot be earlier than the current principal joinedAt.');
                }
                await transaction.jnvPrincipal.updateMany({
                    where: { organizationId, relievedAt: null, isDeleted: false },
                    data: { relievedAt: joinedAt, updatedById: actor.id },
                });
            }
            return transaction.jnvPrincipal.create({
                data: {
                    organizationId,
                    principalNameEnglish: dto.principalNameEnglish,
                    principalNameHindi: dto.principalNameHindi,
                    principalDesignationEnglish: dto.principalDesignationEnglish,
                    principalDesignationHindi: dto.principalDesignationHindi,
                    email: dto.email,
                    mobile: dto.mobile,
                    messageEnglish: dto.messageEnglish,
                    messageHindi: dto.messageHindi,
                    joinedAt,
                    relievedAt: dto.relievedAt,
                    displayOrder: dto.displayOrder ?? 0,
                    isActive: dto.isActive ?? true,
                    ...(file ? this.fileData(file) : {}),
                    createdById: actor.id,
                    updatedById: actor.id,
                },
            });
        });
        return this.toResponse(principal);
    }
    async findAll(organizationId) {
        await this.ensureJnv(organizationId);
        const principals = await this.prisma.jnvPrincipal.findMany({
            where: { organizationId, isDeleted: false },
            orderBy: [{ joinedAt: 'desc' }, { displayOrder: 'asc' }, { id: 'desc' }],
        });
        return principals.map((principal) => this.toResponse(principal));
    }
    async findOne(organizationId, id) {
        return this.toResponse(await this.findExisting(organizationId, id));
    }
    async update(organizationId, id, dto, actor) {
        const existing = await this.findExisting(organizationId, id);
        this.ensureTenure(dto.joinedAt ?? existing.joinedAt, dto.relievedAt ?? existing.relievedAt);
        return this.toResponse(await this.prisma.jnvPrincipal.update({
            where: { id },
            data: { ...dto, updatedById: actor.id },
        }));
    }
    async replaceImage(organizationId, id, file, actor) {
        await (0, jnv_principals_storage_1.validateJnvPrincipalImage)(file);
        const existing = await this.findExisting(organizationId, id);
        const principal = await this.prisma.jnvPrincipal.update({
            where: { id },
            data: { ...this.fileData(file), updatedById: actor.id },
        });
        if (existing.imagePath)
            await this.deleteStoredFile(existing.imagePath);
        return this.toResponse(principal);
    }
    async remove(organizationId, id, actor) {
        await this.findExisting(organizationId, id);
        return this.toResponse(await this.prisma.jnvPrincipal.update({
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
    async findPublicCurrent(organizationId) {
        await this.ensureJnv(organizationId);
        const principal = await this.prisma.jnvPrincipal.findFirst({
            where: {
                organizationId,
                relievedAt: null,
                isActive: true,
                isDeleted: false,
            },
        });
        if (!principal)
            throw new common_1.NotFoundException('Current principal not found.');
        return this.toPublicResponse(principal);
    }
    async findPublicHistory(organizationId) {
        await this.ensureJnv(organizationId);
        const principals = await this.prisma.jnvPrincipal.findMany({
            where: { organizationId, isActive: true, isDeleted: false },
            orderBy: [{ joinedAt: 'desc' }, { displayOrder: 'asc' }, { id: 'desc' }],
        });
        return principals.map((principal) => this.toPublicResponse(principal));
    }
    async imageStream(organizationId, id, publicOnly = false) {
        const principal = await this.prisma.jnvPrincipal.findFirst({
            where: {
                id,
                organizationId,
                isDeleted: false,
                ...(publicOnly ? { isActive: true } : {}),
            },
        });
        if (!principal?.imagePath || !principal.mimeType)
            throw new common_1.NotFoundException('Principal picture not found.');
        return {
            stream: (0, node_fs_1.createReadStream)(this.absolutePath(principal.imagePath)),
            mimeType: principal.mimeType,
        };
    }
    async cleanupUploadedFile(file) {
        await (0, promises_1.unlink)(file.path).catch(() => undefined);
    }
    async ensureJnv(organizationId) {
        const organization = await this.prisma.organization.findFirst({
            where: {
                id: organizationId,
                isDeleted: false,
                isFunctional: true,
                organizationType: { code: 'JNV', isActive: true },
            },
            select: { id: true },
        });
        if (!organization)
            throw new common_1.BadRequestException('organizationId must identify an active JNV organization.');
    }
    async findExisting(organizationId, id) {
        const principal = await this.prisma.jnvPrincipal.findFirst({
            where: { id, organizationId, isDeleted: false },
        });
        if (!principal)
            throw new common_1.NotFoundException('JNV principal not found.');
        return principal;
    }
    ensureTenure(joinedAt, relievedAt) {
        if (joinedAt && relievedAt && relievedAt < joinedAt)
            throw new common_1.BadRequestException('relievedAt cannot be before joinedAt.');
    }
    fileData(file) {
        return {
            storedFilename: file.filename,
            imagePath: (0, node_path_1.relative)(process.cwd(), file.path).split(node_path_1.sep).join('/'),
            mimeType: file.mimetype,
            extension: (0, node_path_1.extname)(file.filename).slice(1).toLowerCase(),
            fileSize: BigInt(file.size),
        };
    }
    absolutePath(path) {
        return (0, node_path_1.resolve)(process.cwd(), path);
    }
    async deleteStoredFile(path) {
        const absolute = this.absolutePath(path);
        if (absolute.startsWith((0, node_path_1.resolve)(jnv_principals_storage_1.JNV_PRINCIPAL_UPLOADS_ROOT) + node_path_1.sep))
            await (0, promises_1.unlink)(absolute).catch(() => undefined);
    }
    toResponse(principal) {
        return {
            id: principal.id,
            organizationId: principal.organizationId,
            principalNameEnglish: principal.principalNameEnglish,
            principalNameHindi: principal.principalNameHindi,
            principalDesignationEnglish: principal.principalDesignationEnglish,
            principalDesignationHindi: principal.principalDesignationHindi,
            email: principal.email,
            mobile: principal.mobile,
            messageEnglish: principal.messageEnglish,
            messageHindi: principal.messageHindi,
            pictureUrl: principal.imagePath
                ? `/api/jnvs/${principal.organizationId}/principals/${principal.id}/image`
                : null,
            mimeType: principal.mimeType,
            extension: principal.extension,
            fileSize: principal.fileSize?.toString() ?? null,
            joinedAt: principal.joinedAt,
            relievedAt: principal.relievedAt,
            displayOrder: principal.displayOrder,
            isActive: principal.isActive,
            createdAt: principal.createdAt,
            updatedAt: principal.updatedAt,
        };
    }
    toPublicResponse(principal) {
        return {
            id: principal.id,
            organization_id: principal.organizationId,
            principal_name_english: principal.principalNameEnglish,
            principal_name_hindi: principal.principalNameHindi,
            principal_designation_english: principal.principalDesignationEnglish,
            principal_designation_hindi: principal.principalDesignationHindi,
            email: principal.email,
            mobile: principal.mobile,
            message_english: principal.messageEnglish,
            message_hindi: principal.messageHindi,
            picture_url: principal.imagePath
                ? `/api/public/jnvs/${principal.organizationId}/principals/${principal.id}/image`
                : null,
            joined_at: principal.joinedAt,
            relieved_at: principal.relievedAt,
            display_order: principal.displayOrder,
        };
    }
};
exports.JnvPrincipalsService = JnvPrincipalsService;
exports.JnvPrincipalsService = JnvPrincipalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JnvPrincipalsService);
//# sourceMappingURL=jnv-principals.service.js.map