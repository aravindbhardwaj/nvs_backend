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
exports.MediaTypesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_media_type_dto_1 = require("./dto/create-media-type.dto");
const get_media_types_query_dto_1 = require("./dto/get-media-types-query.dto");
const update_media_type_dto_1 = require("./dto/update-media-type.dto");
const media_types_service_1 = require("./media-types.service");
let MediaTypesController = class MediaTypesController {
    mediaTypesService;
    constructor(mediaTypesService) {
        this.mediaTypesService = mediaTypesService;
    }
    async create(dto, user) {
        return {
            message: 'Media type created successfully.',
            data: await this.mediaTypesService.create(dto, user),
        };
    }
    async findAll(query) {
        return {
            message: 'Media types retrieved successfully.',
            data: await this.mediaTypesService.findAll(query),
        };
    }
    async findOne(id) {
        return {
            message: 'Media type retrieved successfully.',
            data: await this.mediaTypesService.findOne(id),
        };
    }
    async update(id, dto, user) {
        return {
            message: 'Media type updated successfully.',
            data: await this.mediaTypesService.update(id, dto, user),
        };
    }
    async remove(id, user) {
        return {
            message: 'Media type deleted successfully.',
            data: await this.mediaTypesService.remove(id, user),
        };
    }
    async restore(id, user) {
        return {
            message: 'Media type restored successfully.',
            data: await this.mediaTypesService.restore(id, user),
        };
    }
};
exports.MediaTypesController = MediaTypesController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_TYPE_CREATE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_media_type_dto_1.CreateMediaTypeDto, Object]),
    __metadata("design:returntype", Promise)
], MediaTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.HEADQUARTER, client_1.Role.NLI, client_1.Role.REGIONAL, client_1.Role.JNV),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_media_types_query_dto_1.GetMediaTypesQueryDto]),
    __metadata("design:returntype", Promise)
], MediaTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_TYPE_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MediaTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_TYPE_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_media_type_dto_1.UpdateMediaTypeDto, Object]),
    __metadata("design:returntype", Promise)
], MediaTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_TYPE_DELETE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MediaTypesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_TYPE_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MediaTypesController.prototype, "restore", null);
exports.MediaTypesController = MediaTypesController = __decorate([
    (0, common_1.Controller)('api/media-types'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [media_types_service_1.MediaTypesService])
], MediaTypesController);
//# sourceMappingURL=media-types.controller.js.map