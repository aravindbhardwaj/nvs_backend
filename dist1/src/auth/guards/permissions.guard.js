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
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
const effective_permissions_service_1 = require("../services/effective-permissions.service");
let PermissionsGuard = class PermissionsGuard {
    reflector;
    effectivePermissions;
    constructor(reflector, effectivePermissions) {
        this.reflector = reflector;
        this.effectivePermissions = effectivePermissions;
    }
    async canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(require_permission_decorator_1.REQUIRED_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermissions?.length) {
            return true;
        }
        const request = context
            .switchToHttp()
            .getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('You do not have permission to access this resource.');
        }
        if (user.role === client_1.Role.SUPER_ADMIN) {
            return true;
        }
        const effectivePermissions = await this.effectivePermissions.resolve(user.id, user.role);
        if (!requiredPermissions.every((permission) => effectivePermissions.has(permission))) {
            throw new common_1.ForbiddenException('You do not have permission to access this resource.');
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        effective_permissions_service_1.EffectivePermissionsService])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map