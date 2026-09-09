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
exports.UserPermissionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const replace_user_permissions_dto_1 = require("./dto/replace-user-permissions.dto");
const user_permissions_service_1 = require("./user-permissions.service");
let UserPermissionsController = class UserPermissionsController {
    userPermissionsService;
    constructor(userPermissionsService) {
        this.userPermissionsService = userPermissionsService;
    }
    async findByUser(userId) {
        return {
            message: 'User permission overrides retrieved successfully.',
            data: await this.userPermissionsService.findByUser(userId),
        };
    }
    async replace(userId, dto, user) {
        return {
            message: 'User permission overrides replaced successfully.',
            data: await this.userPermissionsService.replace(userId, dto, user),
        };
    }
    async remove(userId, user) {
        return {
            message: 'User permission overrides removed successfully.',
            data: await this.userPermissionsService.remove(userId, user),
        };
    }
};
exports.UserPermissionsController = UserPermissionsController;
__decorate([
    (0, common_1.Get)(':userId'),
    (0, require_permission_decorator_1.RequirePermission)('USER_VIEW'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserPermissionsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Put)(':userId'),
    (0, require_permission_decorator_1.RequirePermission)('USER_UPDATE'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, replace_user_permissions_dto_1.ReplaceUserPermissionsDto, Object]),
    __metadata("design:returntype", Promise)
], UserPermissionsController.prototype, "replace", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    (0, require_permission_decorator_1.RequirePermission)('USER_UPDATE'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserPermissionsController.prototype, "remove", null);
exports.UserPermissionsController = UserPermissionsController = __decorate([
    (0, common_1.Controller)('api/user-permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [user_permissions_service_1.UserPermissionsService])
], UserPermissionsController);
//# sourceMappingURL=user-permissions.controller.js.map