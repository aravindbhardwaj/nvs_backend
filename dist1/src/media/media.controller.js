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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const organization_owned_resource_decorator_1 = require("../auth/decorators/organization-owned-resource.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const organization_ownership_guard_1 = require("../auth/guards/organization-ownership.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_external_media_dto_1 = require("./dto/create-external-media.dto");
const get_media_query_dto_1 = require("./dto/get-media-query.dto");
const update_media_dto_1 = require("./dto/update-media.dto");
const upload_media_dto_1 = require("./dto/upload-media.dto");
const media_constants_1 = require("./media.constants");
const media_service_1 = require("./media.service");
const media_storage_1 = require("./media.storage");
const uploadOptions = {
    storage: media_storage_1.mediaStorage,
    limits: { fileSize: media_constants_1.MAX_UPLOAD_SIZE },
    fileFilter: (_request, file, callback) => {
        try {
            (0, media_storage_1.validateMediaFile)(file);
            callback(null, true);
        }
        catch (error) {
            callback(error, false);
        }
    },
};
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async createExternal(dto, user) {
        return {
            message: 'External media created successfully.',
            data: await this.mediaService.createExternal(dto, user),
        };
    }
    async upload(dto, files, user) {
        const file = files?.file?.[0];
        const hindiFile = files?.hindiFile?.[0];
        if (!file)
            throw new common_1.BadRequestException('A document file is required.');
        try {
            return {
                message: 'Document uploaded successfully.',
                data: await this.mediaService.upload(dto, file, hindiFile, user),
            };
        }
        catch (error) {
            await this.mediaService.cleanupUploadedFiles([file, hindiFile]);
            throw error;
        }
    }
    async findAll(query, user) {
        return {
            message: 'Media retrieved successfully.',
            data: await this.mediaService.findAll(query, user),
        };
    }
    async download(id, user, response) {
        const document = await this.mediaService.download(id, user);
        response.setHeader('Content-Type', document.mimeType);
        response.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(document.filename)}`);
        document.stream.on('error', () => response.destroy());
        document.stream.pipe(response);
    }
    async downloadHindi(id, user, response) {
        const document = await this.mediaService.downloadHindi(id, user);
        response.setHeader('Content-Type', document.mimeType);
        response.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(document.filename)}`);
        document.stream.on('error', () => response.destroy());
        document.stream.pipe(response);
    }
    async findOne(id, user) {
        return {
            message: 'Media retrieved successfully.',
            data: await this.mediaService.findOne(id, user),
        };
    }
    async replaceFile(id, files, user) {
        const file = files?.file?.[0];
        const hindiFile = files?.hindiFile?.[0];
        if (!file && !hindiFile)
            throw new common_1.BadRequestException('A document file is required.');
        if (file && hindiFile)
            throw new common_1.BadRequestException('Provide either file or hindiFile, not both.');
        try {
            return {
                message: 'Document replaced successfully.',
                data: await this.mediaService.replaceFile(id, file ?? hindiFile, user, Boolean(hindiFile)),
            };
        }
        catch (error) {
            await this.mediaService.cleanupUploadedFiles([file, hindiFile]);
            throw error;
        }
    }
    async update(id, dto, user) {
        return {
            message: 'Media metadata updated successfully.',
            data: await this.mediaService.update(id, dto, user),
        };
    }
    async remove(id, user) {
        return {
            message: 'Media deleted successfully.',
            data: await this.mediaService.remove(id, user),
        };
    }
    async restore(id, user) {
        return {
            message: 'Media restored successfully.',
            data: await this.mediaService.restore(id, user),
        };
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('external'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_UPLOAD'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_external_media_dto_1.CreateExternalMediaDto, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "createExternal", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_UPLOAD'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file', maxCount: 1 },
        { name: 'hindiFile', maxCount: 1 },
    ], uploadOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_media_dto_1.UploadMediaDto, Object, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_VIEW'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_media_query_dto_1.GetMediaQueryDto, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "download", null);
__decorate([
    (0, common_1.Get)(':id/download/hindi'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "downloadHindi", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/file'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_UPLOAD'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file', maxCount: 1 },
        { name: 'hindiFile', maxCount: 1 },
    ], uploadOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "replaceFile", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_UPLOAD'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_media_dto_1.UpdateMediaDto, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_DELETE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, require_permission_decorator_1.RequirePermission)('MEDIA_UPLOAD'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "restore", null);
exports.MediaController = MediaController = __decorate([
    (0, common_1.Controller)('api/media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard, organization_ownership_guard_1.OrganizationOwnershipGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.HEADQUARTER, client_1.Role.NLI, client_1.Role.REGIONAL, client_1.Role.JNV),
    (0, organization_owned_resource_decorator_1.OrganizationOwned)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map