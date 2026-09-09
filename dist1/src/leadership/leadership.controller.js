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
exports.LeadershipController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_leader_dto_1 = require("./dto/create-leader.dto");
const get_leaders_query_dto_1 = require("./dto/get-leaders-query.dto");
const reorder_leaders_dto_1 = require("./dto/reorder-leaders.dto");
const update_leader_dto_1 = require("./dto/update-leader.dto");
const leadership_constants_1 = require("./leadership.constants");
const leadership_service_1 = require("./leadership.service");
const leadership_storage_1 = require("./leadership.storage");
const uploadOptions = {
    storage: leadership_storage_1.leadershipStorage,
    limits: { fileSize: leadership_constants_1.MAX_LEADER_IMAGE_SIZE },
    fileFilter: (_request, file, callback) => {
        try {
            (0, leadership_storage_1.validateLeaderFile)(file);
            callback(null, true);
        }
        catch (error) {
            callback(error, false);
        }
    },
};
let LeadershipController = class LeadershipController {
    leadership;
    constructor(leadership) {
        this.leadership = leadership;
    }
    async create(dto, file, user) {
        if (!file)
            throw new common_1.BadRequestException('A leader picture is required.');
        try {
            return {
                message: 'Leader created successfully.',
                data: await this.leadership.create(dto, file, user),
            };
        }
        catch (error) {
            await this.leadership.cleanupUploadedFile(file);
            throw error;
        }
    }
    async findAll(query) {
        return {
            message: 'Leaders retrieved successfully.',
            data: await this.leadership.findAll(query),
        };
    }
    async image(id, response) {
        const image = await this.leadership.imageStream(id);
        response.setHeader('Content-Type', image.mimeType);
        image.stream.on('error', () => response.destroy());
        image.stream.pipe(response);
    }
    async findOne(id) {
        return {
            message: 'Leader retrieved successfully.',
            data: await this.leadership.findOne(id),
        };
    }
    async reorder(dto, user) {
        await this.leadership.reorder(dto, user);
        return { message: 'Leaders reordered successfully.', data: null };
    }
    async update(id, dto, user) {
        return {
            message: 'Leader updated successfully.',
            data: await this.leadership.update(id, dto, user),
        };
    }
    async replaceImage(id, file, user) {
        if (!file)
            throw new common_1.BadRequestException('A leader picture is required.');
        try {
            return {
                message: 'Leader picture replaced successfully.',
                data: await this.leadership.replaceImage(id, file, user),
            };
        }
        catch (error) {
            await this.leadership.cleanupUploadedFile(file);
            throw error;
        }
    }
    async activate(id, user) {
        return {
            message: 'Leader activated successfully.',
            data: await this.leadership.setActive(id, true, user),
        };
    }
    async deactivate(id, user) {
        return {
            message: 'Leader deactivated successfully.',
            data: await this.leadership.setActive(id, false, user),
        };
    }
    async remove(id, user) {
        return {
            message: 'Leader deleted successfully.',
            data: await this.leadership.remove(id, user),
        };
    }
};
exports.LeadershipController = LeadershipController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('LEADERSHIP_CREATE'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('picture', uploadOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leader_dto_1.CreateLeaderDto, Object, Object]),
    __metadata("design:returntype", Promise)
], LeadershipController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('LEADERSHIP_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_leaders_query_dto_1.GetLeadersQueryDto]),
    __metadata("design:returntype", Promise)
], LeadershipController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/image'),
    (0, require_permission_decorator_1.RequirePermission)('LEADERSHIP_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], LeadershipController.prototype, "image", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('LEADERSHIP_VIEW'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeadershipController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('reorder'),
    (0, require_permission_decorator_1.RequirePermission)('LEADERSHIP_UPDATE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_leaders_dto_1.ReorderLeadersDto, Object]),
    __metadata("design:returntype", Promise)
], LeadershipController.prototype, "reorder", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('LEADERSHIP_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_leader_dto_1.UpdateLeaderDto, Object]),
    __metadata("design:returntype", Promise)
], LeadershipController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/image'),
    (0, require_permission_decorator_1.RequirePermission)('LEADERSHIP_UPDATE'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('picture', uploadOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], LeadershipController.prototype, "replaceImage", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, require_permission_decorator_1.RequirePermission)('LEADERSHIP_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], LeadershipController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, require_permission_decorator_1.RequirePermission)('LEADERSHIP_UPDATE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], LeadershipController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('LEADERSHIP_DELETE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], LeadershipController.prototype, "remove", null);
exports.LeadershipController = LeadershipController = __decorate([
    (0, common_1.Controller)('api/leadership'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.HEADQUARTER, client_1.Role.NLI, client_1.Role.REGIONAL, client_1.Role.JNV),
    __metadata("design:paramtypes", [leadership_service_1.LeadershipService])
], LeadershipController);
//# sourceMappingURL=leadership.controller.js.map