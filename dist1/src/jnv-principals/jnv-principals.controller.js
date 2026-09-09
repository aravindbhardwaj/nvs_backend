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
exports.JnvPrincipalsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_jnv_principal_dto_1 = require("./dto/create-jnv-principal.dto");
const update_jnv_principal_dto_1 = require("./dto/update-jnv-principal.dto");
const jnv_principals_constants_1 = require("./jnv-principals.constants");
const jnv_principals_service_1 = require("./jnv-principals.service");
const jnv_principals_storage_1 = require("./jnv-principals.storage");
const uploadOptions = {
    storage: jnv_principals_storage_1.jnvPrincipalStorage,
    limits: { fileSize: jnv_principals_constants_1.MAX_JNV_PRINCIPAL_IMAGE_SIZE },
    fileFilter: (_request, file, callback) => {
        try {
            (0, jnv_principals_storage_1.validateJnvPrincipalFile)(file);
            callback(null, true);
        }
        catch (error) {
            callback(error, false);
        }
    },
};
let JnvPrincipalsController = class JnvPrincipalsController {
    principals;
    constructor(principals) {
        this.principals = principals;
    }
    async create(organizationId, dto, file, user) {
        try {
            return {
                message: 'JNV principal created successfully.',
                data: await this.principals.create(organizationId, dto, file, user),
            };
        }
        catch (error) {
            if (file)
                await this.principals.cleanupUploadedFile(file);
            throw error;
        }
    }
    async findAll(organizationId) {
        return {
            message: 'JNV principals retrieved successfully.',
            data: await this.principals.findAll(organizationId),
        };
    }
    async image(organizationId, id, response) {
        const image = await this.principals.imageStream(organizationId, id);
        response.setHeader('Content-Type', image.mimeType);
        image.stream.on('error', () => response.destroy());
        image.stream.pipe(response);
    }
    async findOne(organizationId, id) {
        return {
            message: 'JNV principal retrieved successfully.',
            data: await this.principals.findOne(organizationId, id),
        };
    }
    async update(organizationId, id, dto, user) {
        return {
            message: 'JNV principal updated successfully.',
            data: await this.principals.update(organizationId, id, dto, user),
        };
    }
    async replaceImage(organizationId, id, file, user) {
        if (!file)
            throw new common_1.BadRequestException('A principal picture is required.');
        try {
            return {
                message: 'Principal picture updated successfully.',
                data: await this.principals.replaceImage(organizationId, id, file, user),
            };
        }
        catch (error) {
            await this.principals.cleanupUploadedFile(file);
            throw error;
        }
    }
    async remove(organizationId, id, user) {
        return {
            message: 'JNV principal deleted successfully.',
            data: await this.principals.remove(organizationId, id, user),
        };
    }
};
exports.JnvPrincipalsController = JnvPrincipalsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('picture', uploadOptions)),
    __param(0, (0, common_1.Param)('organizationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_jnv_principal_dto_1.CreateJnvPrincipalDto, Object, Object]),
    __metadata("design:returntype", Promise)
], JnvPrincipalsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('organizationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JnvPrincipalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/image'),
    __param(0, (0, common_1.Param)('organizationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], JnvPrincipalsController.prototype, "image", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('organizationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], JnvPrincipalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('organizationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_jnv_principal_dto_1.UpdateJnvPrincipalDto, Object]),
    __metadata("design:returntype", Promise)
], JnvPrincipalsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('picture', uploadOptions)),
    __param(0, (0, common_1.Param)('organizationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], JnvPrincipalsController.prototype, "replaceImage", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('organizationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], JnvPrincipalsController.prototype, "remove", null);
exports.JnvPrincipalsController = JnvPrincipalsController = __decorate([
    (0, common_1.Controller)('api/jnvs/:organizationId/principals'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [jnv_principals_service_1.JnvPrincipalsService])
], JnvPrincipalsController);
//# sourceMappingURL=jnv-principals.controller.js.map