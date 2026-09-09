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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const password_service_1 = require("./services/password.service");
const refresh_token_service_1 = require("./services/refresh-token.service");
const organization_type_role_util_1 = require("./utils/organization-type-role.util");
const userWithOrganizationType = {
    organizationType: { select: { code: true } },
};
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    passwordService;
    refreshTokenService;
    constructor(prisma, jwtService, configService, passwordService, refreshTokenService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.passwordService = passwordService;
        this.refreshTokenService = refreshTokenService;
    }
    async findUserByEmail(email) {
        return this.prisma.user.findUnique({
            where: {
                email: email.toLowerCase(),
            },
            include: userWithOrganizationType,
        });
    }
    async findUserByIdentifier(identifier) {
        const userByEmail = await this.findUserByEmail(identifier);
        if (userByEmail)
            return userByEmail;
        return this.prisma.user.findFirst({
            where: {
                username: {
                    equals: identifier,
                    mode: 'insensitive',
                },
            },
            include: userWithOrganizationType,
        });
    }
    async ensureUserCanLogin(user) {
        if (user.isDeleted || user.deletedAt) {
            await this.createAuthenticationAuditLog(user.id, 'LOGIN_FAILED', {
                reason: 'USER_DELETED',
            });
            throw new common_1.ForbiddenException('User account has been deleted.');
        }
        if (user.status === client_1.UserStatus.INACTIVE) {
            await this.createAuthenticationAuditLog(user.id, 'LOGIN_FAILED', {
                reason: 'USER_INACTIVE',
            });
            throw new common_1.ForbiddenException('User account is inactive.');
        }
        if (user.status === client_1.UserStatus.LOCKED) {
            await this.createAuthenticationAuditLog(user.id, 'LOGIN_FAILED', {
                reason: 'ACCOUNT_LOCKED',
            });
            throw new common_1.ForbiddenException('Account is temporarily locked.');
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            await this.createAuthenticationAuditLog(user.id, 'LOGIN_FAILED', {
                reason: 'ACCOUNT_LOCKED',
            });
            throw new common_1.ForbiddenException('Account is temporarily locked.');
        }
    }
    async recordFailedLogin(user) {
        const maxAttempts = this.configService.getOrThrow('auth.login.maxAttempts');
        const lockMinutes = this.configService.getOrThrow('auth.login.lockMinutes');
        return this.prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: { increment: 1 } },
            });
            const isLocked = updatedUser.failedLoginAttempts >= maxAttempts;
            if (isLocked) {
                await tx.user.update({
                    where: { id: user.id },
                    data: {
                        lockedUntil: new Date(Date.now() + lockMinutes * 60 * 1000),
                    },
                });
            }
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    module: 'AUTHENTICATION',
                    entity: 'USER',
                    entityId: user.id,
                    action: 'LOGIN_FAILED',
                    newValues: {
                        failedLoginAttempts: updatedUser.failedLoginAttempts,
                    },
                },
            });
            if (isLocked) {
                await tx.auditLog.create({
                    data: {
                        userId: user.id,
                        module: 'AUTHENTICATION',
                        entity: 'USER',
                        entityId: user.id,
                        action: 'ACCOUNT_LOCKED',
                        newValues: { lockedUntil: true },
                    },
                });
            }
            return isLocked;
        });
    }
    async resetFailedAttempts(userId) {
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        });
    }
    buildJwtPayload(user) {
        return {
            userId: user.id,
            organizationId: user.organizationId,
            role: (0, organization_type_role_util_1.roleFromOrganizationTypeCode)(user.organizationType.code),
            organizationTypeId: user.organizationTypeId,
            organizationType: user.organizationType.code,
            sessionVersion: user.sessionVersion,
        };
    }
    async generateAccessToken(payload) {
        return this.jwtService.signAsync(payload);
    }
    async createAuthenticationAuditLog(userId, action, newValues) {
        await this.prisma.auditLog.create({
            data: {
                userId,
                module: 'AUTHENTICATION',
                entity: 'USER',
                entityId: userId,
                action,
                newValues,
            },
        });
    }
    async login(dto) {
        const identifier = dto.email ?? dto.username;
        const user = await this.findUserByIdentifier(identifier);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        await this.ensureUserCanLogin(user);
        const valid = await this.passwordService.compare(dto.password, user.passwordHash);
        if (!valid) {
            const accountLocked = await this.recordFailedLogin(user);
            if (accountLocked) {
                throw new common_1.ForbiddenException('Account is temporarily locked.');
            }
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        await this.resetFailedAttempts(user.id);
        const payload = this.buildJwtPayload(user);
        const accessToken = await this.generateAccessToken(payload);
        const refreshToken = await this.refreshTokenService.issue(user.id);
        await this.createAuthenticationAuditLog(user.id, 'LOGIN_SUCCESS');
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                organizationId: user.organizationId,
                organization_type_id: user.organizationTypeId,
                organization_type: user.organizationType.code,
                role: (0, organization_type_role_util_1.roleFromOrganizationTypeCode)(user.organizationType.code),
            },
        };
    }
    async refresh(dto) {
        const validatedToken = await this.refreshTokenService.validate(dto.refreshToken);
        await this.refreshTokenService.cleanupExpiredTokens();
        const accessToken = await this.generateAccessToken(this.buildJwtPayload(validatedToken.user));
        const refreshToken = await this.refreshTokenService.rotate(validatedToken);
        return { accessToken, refreshToken };
    }
    async logout(dto, userId) {
        await this.refreshTokenService.revoke(dto.refreshToken, userId);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        password_service_1.PasswordService,
        refresh_token_service_1.RefreshTokenService])
], AuthService);
//# sourceMappingURL=auth.service.js.map