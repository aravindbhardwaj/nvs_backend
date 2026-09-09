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
exports.GalleryController = void 0;
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
const gallery_constants_1 = require("./gallery.constants");
const gallery_storage_1 = require("./gallery.storage");
const gallery_service_1 = require("./gallery.service");
const bulk_delete_gallery_images_dto_1 = require("./dto/bulk-delete-gallery-images.dto");
const create_gallery_image_dto_1 = require("./dto/create-gallery-image.dto");
const get_gallery_images_query_dto_1 = require("./dto/get-gallery-images-query.dto");
const reorder_gallery_images_dto_1 = require("./dto/reorder-gallery-images.dto");
const update_gallery_image_dto_1 = require("./dto/update-gallery-image.dto");
const uploadOptions = {
    storage: gallery_storage_1.galleryStorage,
    limits: {
        fileSize: gallery_constants_1.MAX_GALLERY_UPLOAD_SIZE,
        files: gallery_constants_1.MAX_GALLERY_UPLOAD_COUNT,
    },
    fileFilter: (_request, file, callback) => {
        try {
            (0, gallery_storage_1.validateGalleryFile)(file);
            callback(null, true);
        }
        catch (error) {
            callback(error, false);
        }
    },
};
let GalleryController = class GalleryController {
    gallery;
    constructor(gallery) {
        this.gallery = gallery;
    }
    async create(dto, file, user) {
        if (!file)
            throw new common_1.BadRequestException('A gallery image is required.');
        try {
            return {
                message: 'Gallery image created successfully.',
                data: await this.gallery.create(dto, file, user),
            };
        }
        catch (error) {
            await this.gallery.cleanupUploadedFiles([file]);
            throw error;
        }
    }
    async bulkUpload(dto, files, user) {
        if (!files?.length)
            throw new common_1.BadRequestException('At least one gallery image is required.');
        try {
            return {
                message: 'Gallery images uploaded successfully.',
                data: await this.gallery.bulkCreate(dto, files, user),
            };
        }
        catch (error) {
            await this.gallery.cleanupUploadedFiles(files);
            throw error;
        }
    }
    async findAll(query, user) {
        return {
            message: 'Gallery images retrieved successfully.',
            data: await this.gallery.findAll(query, user),
        };
    }
    async image(id, user, response) {
        const image = await this.gallery.imageStream(id, user);
        response.setHeader('Content-Type', image.mimeType);
        image.stream.on('error', () => response.destroy());
        image.stream.pipe(response);
    }
    async findOne(id, user) {
        return {
            message: 'Gallery image retrieved successfully.',
            data: await this.gallery.findOne(id, user),
        };
    }
    async reorder(dto, user) {
        await this.gallery.reorder(dto, user);
        return { message: 'Gallery images reordered successfully.', data: null };
    }
    async update(id, dto, user) {
        return {
            message: 'Gallery image updated successfully.',
            data: await this.gallery.update(id, dto, user),
        };
    }
    async replace(id, file, user) {
        if (!file)
            throw new common_1.BadRequestException('A gallery image is required.');
        try {
            return {
                message: 'Gallery image replaced successfully.',
                data: await this.gallery.replaceImage(id, file, user),
            };
        }
        catch (error) {
            await this.gallery.cleanupUploadedFiles([file]);
            throw error;
        }
    }
    async bulkDelete(dto, user) {
        return {
            message: 'Gallery images deleted successfully.',
            data: await this.gallery.bulkRemove(dto.ids, user),
        };
    }
    async remove(id, user) {
        return {
            message: 'Gallery image deleted successfully.',
            data: await this.gallery.remove(id, user),
        };
    }
};
exports.GalleryController = GalleryController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('GALLERY_CREATE'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', uploadOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_gallery_image_dto_1.CreateGalleryImageDto, Object, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk-upload'),
    (0, require_permission_decorator_1.RequirePermission)('GALLERY_CREATE'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', gallery_constants_1.MAX_GALLERY_UPLOAD_COUNT, uploadOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_gallery_image_dto_1.CreateGalleryImageDto, Object, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "bulkUpload", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('GALLERY_VIEW'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_gallery_images_query_dto_1.GetGalleryImagesQueryDto, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/image'),
    (0, require_permission_decorator_1.RequirePermission)('GALLERY_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "image", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('GALLERY_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('reorder'),
    (0, require_permission_decorator_1.RequirePermission)('GALLERY_UPDATE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_gallery_images_dto_1.ReorderGalleryImagesDto, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "reorder", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('GALLERY_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_gallery_image_dto_1.UpdateGalleryImageDto, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/image'),
    (0, require_permission_decorator_1.RequirePermission)('GALLERY_UPDATE'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', uploadOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "replace", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, require_permission_decorator_1.RequirePermission)('GALLERY_DELETE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_gallery_images_dto_1.BulkDeleteGalleryImagesDto, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('GALLERY_DELETE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "remove", null);
exports.GalleryController = GalleryController = __decorate([
    (0, common_1.Controller)('api/gallery'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard, organization_ownership_guard_1.OrganizationOwnershipGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.HEADQUARTER, client_1.Role.NLI, client_1.Role.REGIONAL, client_1.Role.JNV),
    (0, organization_owned_resource_decorator_1.OrganizationOwned)('galleryImage'),
    __metadata("design:paramtypes", [gallery_service_1.GalleryService])
], GalleryController);
//# sourceMappingURL=gallery.controller.js.map