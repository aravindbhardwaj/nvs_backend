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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_organization_dto_1 = require("./dto/create-organization.dto");
const get_organizations_query_dto_1 = require("./dto/get-organizations-query.dto");
const update_organization_dto_1 = require("./dto/update-organization.dto");
const organizations_service_1 = require("./organizations.service");
let OrganizationsController = class OrganizationsController {
    organizationsService;
    constructor(organizationsService) {
        this.organizationsService = organizationsService;
    }
    async create(dto, user) {
        return {
            message: 'Organization created successfully.',
            data: await this.organizationsService.create(dto, user),
        };
    }
    async findAll(query) {
        return {
            message: 'Organizations retrieved successfully.',
            data: await this.organizationsService.findAll(query),
        };
    }
    async findMaster(query) {
        return {
            message: 'Organization master retrieved successfully.',
            data: await this.organizationsService.findMaster(query),
        };
    }
    async findOne(id) {
        return {
            message: 'Organization retrieved successfully.',
            data: await this.organizationsService.findOne(id),
        };
    }
    async update(id, dto, user) {
        return {
            message: 'Organization updated successfully.',
            data: await this.organizationsService.update(id, dto, user),
        };
    }
    async remove(id, user) {
        return {
            message: 'Organization deleted successfully.',
            data: await this.organizationsService.remove(id, user),
        };
    }
    async restore(id, user) {
        return {
            message: 'Organization restored successfully.',
            data: await this.organizationsService.restore(id, user),
        };
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('ORGANIZATION_CREATE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_organization_dto_1.CreateOrganizationDto, Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('ORGANIZATION_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_organizations_query_dto_1.GetOrganizationsQueryDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('master'),
    (0, require_permission_decorator_1.RequirePermission)('ORGANIZATION_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_organizations_query_dto_1.GetOrganizationsQueryDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findMaster", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('ORGANIZATION_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('ORGANIZATION_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_organization_dto_1.UpdateOrganizationDto, Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('ORGANIZATION_DELETE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, require_permission_decorator_1.RequirePermission)('ORGANIZATION_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "restore", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, common_1.Controller)('api/organizations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map