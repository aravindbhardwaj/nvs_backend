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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_user_dto_1 = require("./dto/create-user.dto");
const get_users_query_dto_1 = require("./dto/get-users-query.dto");
const reset_user_password_dto_1 = require("./dto/reset-user-password.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(dto, user) {
        return {
            message: 'User created successfully.',
            data: await this.usersService.create(dto, user),
        };
    }
    async findAll(query) {
        return {
            message: 'Users retrieved successfully.',
            data: await this.usersService.findAll(query),
        };
    }
    async findOne(id) {
        return {
            message: 'User retrieved successfully.',
            data: await this.usersService.findOne(id),
        };
    }
    async update(id, dto, user) {
        return {
            message: 'User updated successfully.',
            data: await this.usersService.update(id, dto, user),
        };
    }
    async activate(id, user) {
        return {
            message: 'User activated successfully.',
            data: await this.usersService.activate(id, user),
        };
    }
    async deactivate(id, user) {
        return {
            message: 'User deactivated successfully.',
            data: await this.usersService.deactivate(id, user),
        };
    }
    async resetPassword(id, dto, user) {
        return {
            message: 'User password reset successfully.',
            data: await this.usersService.resetPassword(id, dto, user),
        };
    }
    async remove(id, user) {
        return {
            message: 'User deleted successfully.',
            data: await this.usersService.remove(id, user),
        };
    }
    async restore(id, user) {
        return {
            message: 'User restored successfully.',
            data: await this.usersService.restore(id, user),
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('USER_CREATE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('USER_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_users_query_dto_1.GetUsersQueryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('USER_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('USER_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, require_permission_decorator_1.RequirePermission)('USER_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, require_permission_decorator_1.RequirePermission)('USER_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Patch)(':id/reset-password'),
    (0, require_permission_decorator_1.RequirePermission)('USER_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reset_user_password_dto_1.ResetUserPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('USER_DELETE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, require_permission_decorator_1.RequirePermission)('USER_RESTORE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "restore", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('api/users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map