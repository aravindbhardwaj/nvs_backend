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
exports.MenusController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_menu_dto_1 = require("./dto/create-menu.dto");
const get_menu_navigation_query_dto_1 = require("./dto/get-menu-navigation-query.dto");
const get_menus_query_dto_1 = require("./dto/get-menus-query.dto");
const update_menu_dto_1 = require("./dto/update-menu.dto");
const menus_service_1 = require("./menus.service");
let MenusController = class MenusController {
    menusService;
    constructor(menusService) {
        this.menusService = menusService;
    }
    async create(dto, user) {
        return {
            message: 'Menu created successfully.',
            data: await this.menusService.create(dto, user),
        };
    }
    async findAll(query) {
        return {
            message: 'Menus retrieved successfully.',
            data: await this.menusService.findAll(query),
        };
    }
    async navigation(query) {
        return {
            message: 'Menu navigation retrieved successfully.',
            data: await this.menusService.navigation(query),
        };
    }
    async findOne(id) {
        return {
            message: 'Menu retrieved successfully.',
            data: await this.menusService.findOne(id),
        };
    }
    async update(id, dto, user) {
        return {
            message: 'Menu updated successfully.',
            data: await this.menusService.update(id, dto, user),
        };
    }
    async activate(id, user) {
        return {
            message: 'Menu activated successfully.',
            data: await this.menusService.setActive(id, true, user),
        };
    }
    async deactivate(id, user) {
        return {
            message: 'Menu deactivated successfully.',
            data: await this.menusService.setActive(id, false, user),
        };
    }
};
exports.MenusController = MenusController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('MENU_CREATE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_menu_dto_1.CreateMenuDto, Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('MENU_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_menus_query_dto_1.GetMenusQueryDto]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('navigation'),
    (0, public_decorator_1.Public)(),
    (0, roles_decorator_1.Roles)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_menu_navigation_query_dto_1.GetMenuNavigationQueryDto]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "navigation", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('MENU_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('MENU_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_menu_dto_1.UpdateMenuDto, Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, require_permission_decorator_1.RequirePermission)('MENU_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, require_permission_decorator_1.RequirePermission)('MENU_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "deactivate", null);
exports.MenusController = MenusController = __decorate([
    (0, common_1.Controller)('api/menus'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [menus_service_1.MenusService])
], MenusController);
//# sourceMappingURL=menus.controller.js.map