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
exports.BannersController = void 0;
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
const banner_constants_1 = require("./banner.constants");
const banner_storage_1 = require("./banner.storage");
const banners_service_1 = require("./banners.service");
const create_banner_dto_1 = require("./dto/create-banner.dto");
const get_banners_query_dto_1 = require("./dto/get-banners-query.dto");
const update_banner_dto_1 = require("./dto/update-banner.dto");
const uploadOptions = {
    storage: banner_storage_1.bannerStorage,
    limits: { fileSize: banner_constants_1.MAX_BANNER_UPLOAD_SIZE },
    fileFilter: (_request, file, callback) => {
        try {
            (0, banner_storage_1.validateBannerFile)(file);
            callback(null, true);
        }
        catch (error) {
            callback(error, false);
        }
    },
};
let BannersController = class BannersController {
    bannersService;
    constructor(bannersService) {
        this.bannersService = bannersService;
    }
    async create(dto, file, user) {
        if (!file)
            throw new common_1.BadRequestException('A banner image is required.');
        try {
            return {
                message: 'Banner created successfully.',
                data: await this.bannersService.create(dto, file, user),
            };
        }
        catch (error) {
            await this.bannersService.cleanupUploadedFile(file);
            throw error;
        }
    }
    async findAll(query, user) {
        return {
            message: 'Banners retrieved successfully.',
            data: await this.bannersService.findAll(query, user),
        };
    }
    async image(id, user, response) {
        const image = await this.bannersService.imageStream(id, user);
        response.setHeader('Content-Type', image.mimeType);
        image.stream.on('error', () => response.destroy());
        image.stream.pipe(response);
    }
    async findOne(id, user) {
        return {
            message: 'Banner retrieved successfully.',
            data: await this.bannersService.findOne(id, user),
        };
    }
    async update(id, dto, user) {
        return {
            message: 'Banner updated successfully.',
            data: await this.bannersService.update(id, dto, user),
        };
    }
    async replaceImage(id, file, user) {
        if (!file)
            throw new common_1.BadRequestException('A banner image is required.');
        try {
            return {
                message: 'Banner image replaced successfully.',
                data: await this.bannersService.replaceImage(id, file, user),
            };
        }
        catch (error) {
            await this.bannersService.cleanupUploadedFile(file);
            throw error;
        }
    }
    async activate(id, user) {
        return {
            message: 'Banner activated successfully.',
            data: await this.bannersService.setActive(id, true, user),
        };
    }
    async deactivate(id, user) {
        return {
            message: 'Banner deactivated successfully.',
            data: await this.bannersService.setActive(id, false, user),
        };
    }
    async remove(id, user) {
        return {
            message: 'Banner deleted successfully.',
            data: await this.bannersService.remove(id, user),
        };
    }
    async restore(id, user) {
        return {
            message: 'Banner restored successfully.',
            data: await this.bannersService.restore(id, user),
        };
    }
};
exports.BannersController = BannersController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('BANNER_CREATE'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', uploadOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_banner_dto_1.CreateBannerDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('BANNER_VIEW'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_banners_query_dto_1.GetBannersQueryDto, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/image'),
    (0, require_permission_decorator_1.RequirePermission)('BANNER_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "image", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('BANNER_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('BANNER_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_banner_dto_1.UpdateBannerDto, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/image'),
    (0, require_permission_decorator_1.RequirePermission)('BANNER_UPDATE'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', uploadOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "replaceImage", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, require_permission_decorator_1.RequirePermission)('BANNER_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, require_permission_decorator_1.RequirePermission)('BANNER_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('BANNER_DELETE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, require_permission_decorator_1.RequirePermission)('BANNER_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "restore", null);
exports.BannersController = BannersController = __decorate([
    (0, common_1.Controller)('api/banners'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard, organization_ownership_guard_1.OrganizationOwnershipGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.HEADQUARTER, client_1.Role.NLI, client_1.Role.REGIONAL, client_1.Role.JNV),
    (0, organization_owned_resource_decorator_1.OrganizationOwned)('banner'),
    __metadata("design:paramtypes", [banners_service_1.BannersService])
], BannersController);
//# sourceMappingURL=banners.controller.js.map