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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const password_service_1 = require("../auth/services/password.service");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
const userInclude = {
    organization: {
        select: { id: true, organizationName: true, organizationCode: true },
    },
    organizationType: { select: { id: true, code: true, name: true } },
};
let UsersService = class UsersService {
    prisma;
    passwordService;
    constructor(prisma, passwordService) {
        this.prisma = prisma;
        this.passwordService = passwordService;
    }
    async create(dto, actor) {
        await this.ensureEmailIsUnique(dto.email);
        if (dto.username)
            await this.ensureUsernameIsUnique(dto.username);
        await this.ensureOrganizationTypeCompatibility(dto.organizationId, dto.organization_type_id);
        const passwordHash = await this.passwordService.hash(dto.password);
        const user = await this.prisma.$transaction(async (transaction) => {
            const createdUser = await transaction.user.create({
                data: {
                    name: dto.name,
                    username: dto.username ?? null,
                    email: dto.email,
                    passwordHash,
                    mobile: dto.mobile ?? null,
                    address: dto.address ?? null,
                    organizationId: dto.organizationId,
                    organizationTypeId: dto.organization_type_id,
                    createdById: actor.id,
                    updatedById: actor.id,
                },
                include: userInclude,
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'USER',
                    entity: 'USER',
                    entityId: createdUser.id,
                    action: 'CREATE',
                    newValues: this.toAuditValues(createdUser),
                },
            });
            return createdUser;
        });
        return this.toResponse(user);
    }
    async findAll(query) {
        const where = this.buildWhere(query);
        const orderBy = {
            [query.sort]: query.order,
        };
        const [users, totalItems] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                include: userInclude,
                orderBy,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            items: users.map((user) => this.toResponse(user)),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, isDeleted: false },
            include: userInclude,
        });
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        return this.toResponse(user);
    }
    async update(id, dto, actor) {
        const existingUser = await this.findActiveUser(id);
        if (dto.email)
            await this.ensureEmailIsUnique(dto.email, id);
        if (dto.username)
            await this.ensureUsernameIsUnique(dto.username, id);
        const organizationId = dto.organizationId ?? existingUser.organizationId;
        const organizationTypeId = dto.organization_type_id ?? existingUser.organizationTypeId;
        if (dto.organizationId || dto.organization_type_id)
            await this.ensureOrganizationTypeCompatibility(organizationId, organizationTypeId);
        const user = await this.prisma.$transaction(async (transaction) => {
            const updatedUser = await transaction.user.update({
                where: { id },
                data: {
                    name: dto.name,
                    username: dto.username,
                    email: dto.email,
                    mobile: dto.mobile,
                    address: dto.address,
                    organizationId: dto.organizationId,
                    organizationTypeId: dto.organization_type_id,
                    updatedById: actor.id,
                },
                include: userInclude,
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'USER',
                    entity: 'USER',
                    entityId: id,
                    action: 'UPDATE',
                    previousValues: this.toAuditValues(existingUser),
                    newValues: this.toAuditValues(updatedUser),
                },
            });
            if (dto.organization_type_id &&
                dto.organization_type_id !== existingUser.organizationTypeId) {
                await transaction.auditLog.create({
                    data: {
                        userId: actor.id,
                        module: 'USER',
                        entity: 'USER',
                        entityId: id,
                        action: 'ROLE_CHANGE',
                        previousValues: {
                            organization_type_id: existingUser.organizationTypeId,
                        },
                        newValues: { organization_type_id: updatedUser.organizationTypeId },
                    },
                });
            }
            if (dto.organizationId &&
                dto.organizationId !== existingUser.organizationId) {
                await transaction.auditLog.create({
                    data: {
                        userId: actor.id,
                        module: 'USER',
                        entity: 'USER',
                        entityId: id,
                        action: 'ORGANIZATION_CHANGE',
                        previousValues: { organizationId: existingUser.organizationId },
                        newValues: { organizationId: updatedUser.organizationId },
                    },
                });
            }
            return updatedUser;
        });
        return this.toResponse(user);
    }
    async activate(id, actor) {
        return this.updateStatus(id, client_1.UserStatus.ACTIVE, 'ACTIVATE', actor);
    }
    async deactivate(id, actor) {
        return this.updateStatus(id, client_1.UserStatus.INACTIVE, 'DEACTIVATE', actor);
    }
    async resetPassword(id, dto, actor) {
        const existingUser = await this.findActiveUser(id);
        const passwordHash = await this.passwordService.hash(dto.password);
        const user = await this.prisma.$transaction(async (transaction) => {
            const updatedUser = await transaction.user.update({
                where: { id },
                data: {
                    passwordHash,
                    passwordChangedAt: new Date(),
                    passwordResetRequired: false,
                    sessionVersion: { increment: 1 },
                    updatedById: actor.id,
                },
                include: userInclude,
            });
            await transaction.refreshToken.updateMany({
                where: { userId: id, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'USER',
                    entity: 'USER',
                    entityId: id,
                    action: 'PASSWORD_RESET',
                    previousValues: {
                        passwordChangedAt: existingUser.passwordChangedAt?.toISOString() ?? null,
                    },
                    newValues: {
                        passwordChangedAt: updatedUser.passwordChangedAt?.toISOString() ?? null,
                        activeRefreshTokensRevoked: true,
                    },
                },
            });
            return updatedUser;
        });
        return this.toResponse(user);
    }
    async remove(id, actor) {
        const user = await this.prisma.$transaction(async (transaction) => {
            const existingUser = await transaction.user.findFirst({
                where: { id, isDeleted: false },
                include: userInclude,
            });
            if (!existingUser) {
                throw new common_1.NotFoundException('User not found or has already been deleted.');
            }
            const deletedUser = await transaction.user.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedById: actor.id,
                    updatedById: actor.id,
                },
                include: userInclude,
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'USER',
                    entity: 'USER',
                    entityId: id,
                    action: 'DELETE',
                    previousValues: this.toAuditValues(existingUser),
                    newValues: this.toAuditValues(deletedUser),
                },
            });
            return deletedUser;
        });
        return this.toResponse(user);
    }
    async restore(id, actor) {
        const user = await this.prisma.$transaction(async (transaction) => {
            const existingUser = await transaction.user.findFirst({
                where: { id, isDeleted: true },
                include: userInclude,
            });
            if (!existingUser)
                throw new common_1.NotFoundException('Deleted user not found.');
            const organization = await transaction.organization.findFirst({
                where: { id: existingUser.organizationId, isDeleted: false },
                select: { id: true },
            });
            if (!organization) {
                throw new common_1.ConflictException('User cannot be restored because its organization has been deleted.');
            }
            const restoredUser = await transaction.user.update({
                where: { id },
                data: {
                    isDeleted: false,
                    deletedAt: null,
                    deletedById: null,
                    updatedById: actor.id,
                },
                include: userInclude,
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'USER',
                    entity: 'USER',
                    entityId: id,
                    action: 'RESTORE',
                    previousValues: this.toAuditValues(existingUser),
                    newValues: this.toAuditValues(restoredUser),
                },
            });
            return restoredUser;
        });
        return this.toResponse(user);
    }
    async updateStatus(id, status, action, actor) {
        const user = await this.prisma.$transaction(async (transaction) => {
            const existingUser = await transaction.user.findFirst({
                where: { id, isDeleted: false },
                include: userInclude,
            });
            if (!existingUser)
                throw new common_1.NotFoundException('User not found.');
            const updatedUser = await transaction.user.update({
                where: { id },
                data: { status, updatedById: actor.id },
                include: userInclude,
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'USER',
                    entity: 'USER',
                    entityId: id,
                    action,
                    previousValues: this.toAuditValues(existingUser),
                    newValues: this.toAuditValues(updatedUser),
                },
            });
            return updatedUser;
        });
        return this.toResponse(user);
    }
    async findActiveUser(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, isDeleted: false },
            include: userInclude,
        });
        if (!user)
            throw new common_1.NotFoundException('User not found or has been deleted.');
        return user;
    }
    async ensureEmailIsUnique(email, excludedId) {
        const user = await this.prisma.user.findFirst({
            where: { email, ...(excludedId ? { id: { not: excludedId } } : {}) },
            select: { id: true },
        });
        if (user)
            throw new common_1.ConflictException('A user with this email already exists.');
    }
    async ensureUsernameIsUnique(username, excludedId) {
        const user = await this.prisma.user.findFirst({
            where: {
                username: { equals: username, mode: 'insensitive' },
                ...(excludedId ? { id: { not: excludedId } } : {}),
            },
            select: { id: true },
        });
        if (user)
            throw new common_1.ConflictException('A user with this username already exists.');
    }
    async ensureActiveOrganization(id) {
        const organization = await this.prisma.organization.findFirst({
            where: { id, isDeleted: false },
            select: { id: true },
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found or has been deleted.');
        }
    }
    async ensureOrganizationTypeCompatibility(organizationId, organizationTypeId) {
        const [organization, organizationType] = await Promise.all([
            this.prisma.organization.findFirst({
                where: { id: organizationId, isDeleted: false },
                select: { organizationTypeId: true },
            }),
            this.prisma.organizationType.findFirst({
                where: { id: organizationTypeId, isActive: true },
                select: { id: true, code: true },
            }),
        ]);
        if (!organization)
            throw new common_1.NotFoundException('Organization not found or has been deleted.');
        if (!organizationType)
            throw new common_1.NotFoundException('Organization type not found or is inactive.');
        if (organizationType.code !== 'SUPER_ADMIN' &&
            organization.organizationTypeId !== organizationTypeId)
            throw new common_1.ConflictException('User organization type must match the organization type.');
    }
    buildWhere(query) {
        const where = {
            isDeleted: query.isDeleted ?? false,
            ...(query.organizationId ? { organizationId: query.organizationId } : {}),
            ...(query.organization_type_id
                ? { organizationTypeId: query.organization_type_id }
                : {}),
            ...(query.status ? { status: query.status } : {}),
        };
        if (query.search?.trim()) {
            where.OR = [
                { name: { contains: query.search.trim(), mode: 'insensitive' } },
                { username: { contains: query.search.trim(), mode: 'insensitive' } },
                { email: { contains: query.search.trim(), mode: 'insensitive' } },
                { mobile: { contains: query.search.trim(), mode: 'insensitive' } },
            ];
        }
        return where;
    }
    toResponse(user) {
        return {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            address: user.address,
            organizationId: user.organizationId,
            organization_type_id: user.organizationTypeId,
            organization: {
                id: user.organization.id,
                name: user.organization.organizationName,
                code: user.organization.organizationCode,
            },
            organization_type: {
                id: user.organizationType.id,
                code: user.organizationType.code,
                name: user.organizationType.name,
            },
            status: user.status,
            lastLoginAt: user.lastLoginAt,
            isDeleted: user.isDeleted,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    toAuditValues(user) {
        return {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            address: user.address,
            organizationId: user.organizationId,
            organization_type_id: user.organizationTypeId,
            organization_type: user.organizationType.code,
            status: user.status,
            failedLoginAttempts: user.failedLoginAttempts,
            lockedUntil: user.lockedUntil?.toISOString() ?? null,
            lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
            isDeleted: user.isDeleted,
            deletedAt: user.deletedAt?.toISOString() ?? null,
            deletedById: user.deletedById,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_service_1.PasswordService])
], UsersService);
//# sourceMappingURL=users.service.js.map