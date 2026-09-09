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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const replace_role_permissions_dto_1 = require("./dto/replace-role-permissions.dto");
const role_permissions_service_1 = require("./role-permissions.service");
let RolePermissionsController = class RolePermissionsController {
    rolePermissionsService;
    constructor(rolePermissionsService) {
        this.rolePermissionsService = rolePermissionsService;
    }
    async findByRole(role) {
        return {
            message: 'Role permissions retrieved successfully.',
            data: await this.rolePermissionsService.findByRole(role),
        };
    }
    async replace(role, dto, user) {
        return {
            message: 'Role permissions updated successfully.',
            data: await this.rolePermissionsService.replace(role, dto, user),
        };
    }
};
exports.RolePermissionsController = RolePermissionsController;
__decorate([
    (0, common_1.Get)(':role'),
    (0, require_permission_decorator_1.RequirePermission)('ROLE_PERMISSION_VIEW'),
    __param(0, (0, common_1.Param)('role', new common_1.ParseEnumPipe(client_1.Role))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolePermissionsController.prototype, "findByRole", null);
__decorate([
    (0, common_1.Put)(':role'),
    (0, require_permission_decorator_1.RequirePermission)('ROLE_PERMISSION_UPDATE'),
    __param(0, (0, common_1.Param)('role', new common_1.ParseEnumPipe(client_1.Role))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, replace_role_permissions_dto_1.ReplaceRolePermissionsDto, Object]),
    __metadata("design:returntype", Promise)
], RolePermissionsController.prototype, "replace", null);
exports.RolePermissionsController = RolePermissionsController = __decorate([
    (0, common_1.Controller)('api/role-permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [role_permissions_service_1.RolePermissionsService])
], RolePermissionsController);
//# sourceMappingURL=role-permissions.controller.js.map