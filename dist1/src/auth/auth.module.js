"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const password_service_1 = require("./services/password.service");
const effective_permissions_service_1 = require("./services/effective-permissions.service");
const organization_ownership_service_1 = require("./services/organization-ownership.service");
const refresh_token_repository_service_1 = require("./services/refresh-token.repository.service");
const refresh_token_service_1 = require("./services/refresh-token.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const prisma_module_1 = require("../prisma/prisma.module");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const organization_ownership_guard_1 = require("./guards/organization-ownership.guard");
const permissions_guard_1 = require("./guards/permissions.guard");
const roles_guard_1 = require("./guards/roles.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: Number(process.env.AUTH_RATE_LIMIT_TTL_MS ?? 60_000),
                    limit: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS ?? 5),
                },
            ]),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.getOrThrow('jwt.secret'),
                    signOptions: {
                        expiresIn: config.getOrThrow('jwt.accessExpiresIn'),
                    },
                }),
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            password_service_1.PasswordService,
            refresh_token_repository_service_1.RefreshTokenRepositoryService,
            refresh_token_service_1.RefreshTokenService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            permissions_guard_1.PermissionsGuard,
            organization_ownership_guard_1.OrganizationOwnershipGuard,
            effective_permissions_service_1.EffectivePermissionsService,
            organization_ownership_service_1.OrganizationOwnershipService,
        ],
        exports: [
            jwt_1.JwtModule,
            auth_service_1.AuthService,
            password_service_1.PasswordService,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            permissions_guard_1.PermissionsGuard,
            organization_ownership_guard_1.OrganizationOwnershipGuard,
            organization_ownership_service_1.OrganizationOwnershipService,
            effective_permissions_service_1.EffectivePermissionsService,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map