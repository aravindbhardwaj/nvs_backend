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
exports.ModalsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_modal_dto_1 = require("./dto/create-modal.dto");
const get_modals_query_dto_1 = require("./dto/get-modals-query.dto");
const reorder_modals_dto_1 = require("./dto/reorder-modals.dto");
const update_modal_dto_1 = require("./dto/update-modal.dto");
const modals_service_1 = require("./modals.service");
let ModalsController = class ModalsController {
    modals;
    constructor(modals) {
        this.modals = modals;
    }
    async create(dto, user) {
        return {
            message: 'Modal created successfully.',
            data: await this.modals.create(dto, user),
        };
    }
    async findAll(query) {
        return {
            message: 'Modals retrieved successfully.',
            data: await this.modals.findAll(query),
        };
    }
    async findOne(id) {
        return {
            message: 'Modal retrieved successfully.',
            data: await this.modals.findOne(id),
        };
    }
    async reorder(dto, user) {
        await this.modals.reorder(dto, user);
        return { message: 'Modals reordered successfully.', data: null };
    }
    async update(id, dto, user) {
        return {
            message: 'Modal updated successfully.',
            data: await this.modals.update(id, dto, user),
        };
    }
    async activate(id, user) {
        return {
            message: 'Modal activated successfully.',
            data: await this.modals.setActive(id, true, user),
        };
    }
    async deactivate(id, user) {
        return {
            message: 'Modal deactivated successfully.',
            data: await this.modals.setActive(id, false, user),
        };
    }
    async remove(id, user) {
        return {
            message: 'Modal deleted successfully.',
            data: await this.modals.remove(id, user),
        };
    }
};
exports.ModalsController = ModalsController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('MODAL_CREATE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_modal_dto_1.CreateModalDto, Object]),
    __metadata("design:returntype", Promise)
], ModalsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('MODAL_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_modals_query_dto_1.GetModalsQueryDto]),
    __metadata("design:returntype", Promise)
], ModalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('MODAL_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ModalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('reorder'),
    (0, require_permission_decorator_1.RequirePermission)('MODAL_UPDATE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_modals_dto_1.ReorderModalsDto, Object]),
    __metadata("design:returntype", Promise)
], ModalsController.prototype, "reorder", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('MODAL_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_modal_dto_1.UpdateModalDto, Object]),
    __metadata("design:returntype", Promise)
], ModalsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, require_permission_decorator_1.RequirePermission)('MODAL_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ModalsController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, require_permission_decorator_1.RequirePermission)('MODAL_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ModalsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('MODAL_DELETE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ModalsController.prototype, "remove", null);
exports.ModalsController = ModalsController = __decorate([
    (0, common_1.Controller)('api/modals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.HEADQUARTER, client_1.Role.NLI, client_1.Role.REGIONAL, client_1.Role.JNV),
    __metadata("design:paramtypes", [modals_service_1.ModalsService])
], ModalsController);
//# sourceMappingURL=modals.controller.js.map