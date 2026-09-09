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
exports.ContentTypesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const content_types_service_1 = require("./content-types.service");
const create_content_type_dto_1 = require("./dto/create-content-type.dto");
const get_content_types_query_dto_1 = require("./dto/get-content-types-query.dto");
const update_content_type_dto_1 = require("./dto/update-content-type.dto");
let ContentTypesController = class ContentTypesController {
    contentTypesService;
    constructor(contentTypesService) {
        this.contentTypesService = contentTypesService;
    }
    async create(dto, user) {
        return {
            message: 'Content type created successfully.',
            data: await this.contentTypesService.create(dto, user),
        };
    }
    async findAll(query) {
        return {
            message: 'Content types retrieved successfully.',
            data: await this.contentTypesService.findAll(query),
        };
    }
    async findOne(id) {
        return {
            message: 'Content type retrieved successfully.',
            data: await this.contentTypesService.findOne(id),
        };
    }
    async update(id, dto, user) {
        return {
            message: 'Content type updated successfully.',
            data: await this.contentTypesService.update(id, dto, user),
        };
    }
    async remove(id, user) {
        return {
            message: 'Content type deleted successfully.',
            data: await this.contentTypesService.remove(id, user),
        };
    }
    async restore(id, user) {
        return {
            message: 'Content type restored successfully.',
            data: await this.contentTypesService.restore(id, user),
        };
    }
};
exports.ContentTypesController = ContentTypesController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('CONTENT_TYPE_CREATE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_content_type_dto_1.CreateContentTypeDto, Object]),
    __metadata("design:returntype", Promise)
], ContentTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.HEADQUARTER, client_1.Role.NLI, client_1.Role.REGIONAL, client_1.Role.JNV),
    (0, require_permission_decorator_1.RequirePermission)('PAGE_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_content_types_query_dto_1.GetContentTypesQueryDto]),
    __metadata("design:returntype", Promise)
], ContentTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('CONTENT_TYPE_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContentTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('CONTENT_TYPE_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_content_type_dto_1.UpdateContentTypeDto, Object]),
    __metadata("design:returntype", Promise)
], ContentTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('CONTENT_TYPE_DELETE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ContentTypesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, require_permission_decorator_1.RequirePermission)('CONTENT_TYPE_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ContentTypesController.prototype, "restore", null);
exports.ContentTypesController = ContentTypesController = __decorate([
    (0, common_1.Controller)('api/content-types'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [content_types_service_1.ContentTypesService])
], ContentTypesController);
//# sourceMappingURL=content-types.controller.js.map