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
exports.RolePermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RolePermissionsService = class RolePermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByRole(role) {
        const rolePermissions = await this.prisma.rolePermission.findMany({
            where: { role },
            include: { permission: true },
            orderBy: { permission: { permissionKey: 'asc' } },
        });
        return {
            role,
            permissions: rolePermissions.map(({ permission }) => this.toPermissionResponse(permission)),
        };
    }
    async replace(role, dto, user) {
        const permissions = await this.prisma.permission.findMany({
            where: { id: { in: dto.permissionIds } },
            orderBy: { permissionKey: 'asc' },
        });
        if (permissions.length !== dto.permissionIds.length) {
            const foundPermissionIds = new Set(permissions.map(({ id }) => id));
            const missingPermissionIds = dto.permissionIds.filter((permissionId) => !foundPermissionIds.has(permissionId));
            throw new common_1.BadRequestException(`Invalid permission IDs: ${missingPermissionIds.join(', ')}.`);
        }
        const previousPermissions = await this.prisma.rolePermission.findMany({
            where: { role },
            include: { permission: true },
            orderBy: { permission: { permissionKey: 'asc' } },
        });
        await this.prisma.$transaction(async (transaction) => {
            await transaction.rolePermission.deleteMany({ where: { role } });
            if (dto.permissionIds.length > 0) {
                await transaction.rolePermission.createMany({
                    data: dto.permissionIds.map((permissionId) => ({
                        role,
                        permissionId,
                    })),
                });
            }
            await transaction.auditLog.create({
                data: {
                    userId: user.id,
                    module: 'ROLE_PERMISSION',
                    entity: 'ROLE_PERMISSION',
                    action: 'UPDATE',
                    previousValues: this.toAuditValues(role, previousPermissions.map(({ permission }) => permission)),
                    newValues: this.toAuditValues(role, permissions),
                },
            });
        });
        return {
            role,
            permissions: permissions.map((permission) => this.toPermissionResponse(permission)),
        };
    }
    toPermissionResponse(permission) {
        return {
            id: permission.id,
            permissionKey: permission.permissionKey,
            module: permission.module,
            action: permission.action,
            description: permission.description,
            createdAt: permission.createdAt,
        };
    }
    toAuditValues(role, permissions) {
        return {
            role,
            permissions: permissions.map((permission) => ({
                id: permission.id,
                permissionKey: permission.permissionKey,
            })),
        };
    }
};
exports.RolePermissionsService = RolePermissionsService;
exports.RolePermissionsService = RolePermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolePermissionsService);
//# sourceMappingURL=role-permissions.service.js.map