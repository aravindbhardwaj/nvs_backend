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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationTypesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const organization_types_service_1 = require("./organization-types.service");
let OrganizationTypesController = class OrganizationTypesController {
    organizationTypesService;
    constructor(organizationTypesService) {
        this.organizationTypesService = organizationTypesService;
    }
    async findAll() {
        return {
            message: 'Organization types retrieved successfully.',
            data: await this.organizationTypesService.findAll(),
        };
    }
};
exports.OrganizationTypesController = OrganizationTypesController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('ORGANIZATION_VIEW'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationTypesController.prototype, "findAll", null);
exports.OrganizationTypesController = OrganizationTypesController = __decorate([
    (0, common_1.Controller)('api/organization-types'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [organization_types_service_1.OrganizationTypesService])
], OrganizationTypesController);
//# sourceMappingURL=organization-types.controller.js.map