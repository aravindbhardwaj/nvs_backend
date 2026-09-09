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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const prisma_service_1 = require("../../prisma/prisma.service");
const organization_type_role_util_1 = require("../utils/organization-type-role.util");
const passport_jwt_1 = require("passport-jwt");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    prisma;
    constructor(configService, prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('jwt.secret'),
        });
        this.prisma = prisma;
    }
    async validate(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.userId },
            include: { organizationType: { select: { code: true } } },
        });
        if (!user ||
            user.isDeleted ||
            user.deletedAt ||
            user.status !== client_1.UserStatus.ACTIVE ||
            user.sessionVersion !== payload.sessionVersion ||
            (user.lockedUntil && user.lockedUntil > new Date())) {
            throw new common_1.UnauthorizedException('User session is no longer valid.');
        }
        return {
            id: user.id,
            email: user.email,
            role: (0, organization_type_role_util_1.roleFromOrganizationTypeCode)(user.organizationType.code),
            organizationId: user.organizationId,
            organizationTypeId: user.organizationTypeId,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map