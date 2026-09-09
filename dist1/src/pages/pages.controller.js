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
exports.PagesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const organization_owned_resource_decorator_1 = require("../auth/decorators/organization-owned-resource.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const organization_ownership_guard_1 = require("../auth/guards/organization-ownership.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_page_dto_1 = require("./dto/create-page.dto");
const get_pages_query_dto_1 = require("./dto/get-pages-query.dto");
const update_page_dto_1 = require("./dto/update-page.dto");
const pages_service_1 = require("./pages.service");
let PagesController = class PagesController {
    pagesService;
    constructor(pagesService) {
        this.pagesService = pagesService;
    }
    async create(dto, user) {
        return {
            message: 'Page created successfully.',
            data: await this.pagesService.create(dto, user),
        };
    }
    async findAll(query, user) {
        return {
            message: 'Pages retrieved successfully.',
            data: await this.pagesService.findAll(query, user),
        };
    }
    async findBySlug(slug, user) {
        return {
            message: 'Page retrieved successfully.',
            data: await this.pagesService.findBySlug(slug, user),
        };
    }
    async findOne(id, user) {
        return {
            message: 'Page retrieved successfully.',
            data: await this.pagesService.findOne(id, user),
        };
    }
    async update(id, dto, user) {
        return {
            message: 'Page updated successfully.',
            data: await this.pagesService.update(id, dto, user),
        };
    }
    async publish(id, user) {
        return {
            message: 'Page published successfully.',
            data: await this.pagesService.publish(id, user),
        };
    }
    async unpublish(id, user) {
        return {
            message: 'Page unpublished successfully.',
            data: await this.pagesService.unpublish(id, user),
        };
    }
    async remove(id, user) {
        return {
            message: 'Page deleted successfully.',
            data: await this.pagesService.remove(id, user),
        };
    }
    async restore(id, user) {
        return {
            message: 'Page restored successfully.',
            data: await this.pagesService.restore(id, user),
        };
    }
};
exports.PagesController = PagesController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('PAGE_CREATE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_page_dto_1.CreatePageDto, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('PAGE_VIEW'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_pages_query_dto_1.GetPagesQueryDto, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, require_permission_decorator_1.RequirePermission)('PAGE_VIEW'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('PAGE_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('PAGE_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_page_dto_1.UpdatePageDto, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    (0, require_permission_decorator_1.RequirePermission)('PAGE_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "publish", null);
__decorate([
    (0, common_1.Patch)(':id/unpublish'),
    (0, require_permission_decorator_1.RequirePermission)('PAGE_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('PAGE_DELETE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, require_permission_decorator_1.RequirePermission)('PAGE_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "restore", null);
exports.PagesController = PagesController = __decorate([
    (0, common_1.Controller)('api/pages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard, organization_ownership_guard_1.OrganizationOwnershipGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.HEADQUARTER, client_1.Role.NLI, client_1.Role.REGIONAL, client_1.Role.JNV),
    (0, organization_owned_resource_decorator_1.OrganizationOwned)('page'),
    __metadata("design:paramtypes", [pages_service_1.PagesService])
], PagesController);
//# sourceMappingURL=pages.controller.js.map