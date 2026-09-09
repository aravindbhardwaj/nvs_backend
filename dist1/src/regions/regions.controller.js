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
exports.RegionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_region_dto_1 = require("./dto/create-region.dto");
const get_regions_query_dto_1 = require("./dto/get-regions-query.dto");
const update_region_dto_1 = require("./dto/update-region.dto");
const regions_service_1 = require("./regions.service");
let RegionsController = class RegionsController {
    regionsService;
    constructor(regionsService) {
        this.regionsService = regionsService;
    }
    async create(dto, user) {
        return {
            message: 'Region created successfully.',
            data: await this.regionsService.create(dto, user),
        };
    }
    async findAll(query) {
        return {
            message: 'Regions retrieved successfully.',
            data: await this.regionsService.findAll(query),
        };
    }
    async findOne(id) {
        return {
            message: 'Region retrieved successfully.',
            data: await this.regionsService.findOne(id),
        };
    }
    async update(id, dto, user) {
        return {
            message: 'Region updated successfully.',
            data: await this.regionsService.update(id, dto, user),
        };
    }
    async remove(id, user) {
        return {
            message: 'Region deleted successfully.',
            data: await this.regionsService.remove(id, user),
        };
    }
    async restore(id, user) {
        return {
            message: 'Region restored successfully.',
            data: await this.regionsService.restore(id, user),
        };
    }
};
exports.RegionsController = RegionsController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('REGION_CREATE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_region_dto_1.CreateRegionDto, Object]),
    __metadata("design:returntype", Promise)
], RegionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('REGION_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_regions_query_dto_1.GetRegionsQueryDto]),
    __metadata("design:returntype", Promise)
], RegionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('REGION_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RegionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('REGION_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_region_dto_1.UpdateRegionDto, Object]),
    __metadata("design:returntype", Promise)
], RegionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('REGION_DELETE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RegionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, require_permission_decorator_1.RequirePermission)('REGION_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RegionsController.prototype, "restore", null);
exports.RegionsController = RegionsController = __decorate([
    (0, common_1.Controller)('api/regions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [regions_service_1.RegionsService])
], RegionsController);
//# sourceMappingURL=regions.controller.js.map