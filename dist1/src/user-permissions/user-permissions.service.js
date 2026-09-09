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
exports.UserPermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const userPermissionWithPermission = {
    permission: true,
};
let UserPermissionsService = class UserPermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUser(userId) {
        await this.ensureUserExists(userId);
        const overrides = await this.findOverrides(userId);
        return this.toResponse(userId, overrides);
    }
    async replace(userId, dto, actor) {
        this.ensureActorIsNotTarget(userId, actor);
        await this.ensureUserExists(userId);
        const permissions = await this.ensurePermissionsExist(dto.permissions);
        const previousOverrides = await this.findOverrides(userId);
        await this.prisma.$transaction(async (transaction) => {
            await transaction.userPermission.deleteMany({ where: { userId } });
            if (dto.permissions.length > 0) {
                await transaction.userPermission.createMany({
                    data: dto.permissions.map(({ permissionId, allowed }) => ({
                        userId,
                        permissionId,
                        allowed,
                        createdById: actor.id,
                    })),
                });
            }
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'USER_PERMISSION',
                    entity: 'USER_PERMISSION',
                    entityId: userId,
                    action: previousOverrides.length === 0 ? 'CREATE' : 'UPDATE',
                    previousValues: this.toAuditValues(userId, previousOverrides),
                    newValues: this.toAuditValues(userId, dto.permissions, permissions),
                },
            });
        });
        return this.toResponse(userId, dto.permissions, permissions);
    }
    async remove(userId, actor) {
        this.ensureActorIsNotTarget(userId, actor);
        await this.ensureUserExists(userId);
        const previousOverrides = await this.findOverrides(userId);
        await this.prisma.$transaction(async (transaction) => {
            await transaction.userPermission.deleteMany({ where: { userId } });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'USER_PERMISSION',
                    entity: 'USER_PERMISSION',
                    entityId: userId,
                    action: 'DELETE',
                    previousValues: this.toAuditValues(userId, previousOverrides),
                    newValues: this.toAuditValues(userId, []),
                },
            });
        });
        return { userId, permissions: [] };
    }
    async ensureUserExists(userId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, isDeleted: false },
            select: { id: true },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} was not found.`);
        }
    }
    async ensurePermissionsExist(overrides) {
        const permissionIds = overrides.map(({ permissionId }) => permissionId);
        const permissions = await this.prisma.permission.findMany({
            where: { id: { in: permissionIds } },
            orderBy: { permissionKey: 'asc' },
        });
        if (permissions.length !== permissionIds.length) {
            const foundIds = new Set(permissions.map(({ id }) => id));
            const missingIds = permissionIds.filter((id) => !foundIds.has(id));
            throw new common_1.BadRequestException(`Invalid permission IDs: ${missingIds.join(', ')}.`);
        }
        return permissions;
    }
    async findOverrides(userId) {
        return this.prisma.userPermission.findMany({
            where: { userId },
            include: userPermissionWithPermission,
            orderBy: { permission: { permissionKey: 'asc' } },
        });
    }
    ensureActorIsNotTarget(userId, actor) {
        if (userId === actor.id) {
            throw new common_1.BadRequestException('Users cannot modify their own permission overrides.');
        }
    }
    toResponse(userId, overrides, permissions) {
        const permissionById = new Map(permissions?.map((permission) => [permission.id, permission]));
        const mapped = overrides.map((override) => {
            const permission = 'permission' in override
                ? override.permission
                : permissionById.get(override.permissionId);
            if (!permission) {
                throw new common_1.BadRequestException('Permission override could not be resolved.');
            }
            return {
                id: permission.id,
                permissionKey: permission.permissionKey,
                module: permission.module,
                action: permission.action,
                description: permission.description,
                createdAt: 'createdAt' in override ? override.createdAt : permission.createdAt,
                allowed: override.allowed,
            };
        });
        return {
            userId,
            permissions: mapped,
        };
    }
    toAuditValues(userId, overrides, permissions) {
        const permissionById = new Map(permissions?.map((permission) => [permission.id, permission]));
        return {
            userId,
            overrides: overrides.map((override) => {
                const permission = 'permission' in override
                    ? override.permission
                    : permissionById.get(override.permissionId);
                return {
                    permissionId: override.permissionId,
                    permissionKey: permission?.permissionKey,
                    allowed: override.allowed,
                };
            }),
        };
    }
};
exports.UserPermissionsService = UserPermissionsService;
exports.UserPermissionsService = UserPermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserPermissionsService);
//# sourceMappingURL=user-permissions.service.js.map