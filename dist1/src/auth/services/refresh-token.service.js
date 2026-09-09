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
exports.RefreshTokenService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
const password_service_1 = require("./password.service");
const refresh_token_repository_service_1 = require("./refresh-token.repository.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let RefreshTokenService = class RefreshTokenService {
    prisma;
    configService;
    passwordService;
    refreshTokenRepository;
    constructor(prisma, configService, passwordService, refreshTokenRepository) {
        this.prisma = prisma;
        this.configService = configService;
        this.passwordService = passwordService;
        this.refreshTokenRepository = refreshTokenRepository;
    }
    async issue(userId) {
        const refreshToken = (0, crypto_1.randomBytes)(48).toString('base64url');
        const tokenHash = await this.passwordService.hashSecret(refreshToken);
        await this.refreshTokenRepository.create({
            tokenHash,
            expiresAt: this.getExpiryDate(),
            user: { connect: { id: userId } },
        });
        return refreshToken;
    }
    async validate(refreshToken) {
        const records = await this.refreshTokenRepository.findAll();
        const record = await this.findMatchingToken(records, refreshToken);
        if (!record) {
            throw new common_1.UnauthorizedException('Invalid refresh token.');
        }
        if (record.revokedAt || record.expiresAt <= new Date()) {
            await this.createAuditLog(record.userId, 'REFRESH_TOKEN_INVALID', {
                reason: record.revokedAt ? 'TOKEN_REVOKED' : 'TOKEN_EXPIRED',
            });
            throw new common_1.UnauthorizedException('Invalid refresh token.');
        }
        if (!this.isUserActive(record.user)) {
            await this.createAuditLog(record.userId, 'REFRESH_TOKEN_INVALID', {
                reason: 'USER_NOT_ACTIVE',
            });
            throw new common_1.UnauthorizedException('User session is no longer valid.');
        }
        return { token: record, user: record.user };
    }
    async rotate(validatedToken) {
        const refreshToken = (0, crypto_1.randomBytes)(48).toString('base64url');
        const tokenHash = await this.passwordService.hashSecret(refreshToken);
        const now = new Date();
        await this.prisma.$transaction(async (tx) => {
            const revoked = await tx.refreshToken.updateMany({
                where: { id: validatedToken.token.id, revokedAt: null },
                data: { revokedAt: now },
            });
            if (revoked.count !== 1) {
                throw new common_1.UnauthorizedException('Invalid refresh token.');
            }
            await tx.refreshToken.create({
                data: {
                    userId: validatedToken.user.id,
                    tokenHash,
                    expiresAt: this.getExpiryDate(),
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: validatedToken.user.id,
                    module: 'AUTHENTICATION',
                    entity: 'REFRESH_TOKEN',
                    entityId: validatedToken.token.id,
                    action: 'REFRESH_TOKEN_REVOKED',
                    newValues: { reason: 'TOKEN_ROTATION' },
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: validatedToken.user.id,
                    module: 'AUTHENTICATION',
                    entity: 'REFRESH_TOKEN',
                    action: 'TOKEN_REFRESHED',
                    newValues: { previousTokenRevoked: true },
                },
            });
        });
        return refreshToken;
    }
    async revoke(refreshToken, userId) {
        const validatedToken = await this.validate(refreshToken);
        if (validatedToken.user.id !== userId) {
            await this.createAuditLog(userId, 'REFRESH_TOKEN_INVALID', {
                reason: 'TOKEN_USER_MISMATCH',
            });
            throw new common_1.UnauthorizedException('Invalid refresh token.');
        }
        await this.prisma.$transaction(async (tx) => {
            const revoked = await tx.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            if (revoked.count < 1) {
                throw new common_1.UnauthorizedException('Invalid refresh token.');
            }
            await tx.user.update({
                where: { id: userId },
                data: { sessionVersion: { increment: 1 } },
            });
            await tx.auditLog.create({
                data: {
                    userId,
                    module: 'AUTHENTICATION',
                    entity: 'REFRESH_TOKEN',
                    entityId: validatedToken.token.id,
                    action: 'REFRESH_TOKEN_REVOKED',
                    newValues: {
                        reason: 'LOGOUT_ALL_SESSIONS',
                        revokedCount: revoked.count,
                    },
                },
            });
            await tx.auditLog.create({
                data: {
                    userId,
                    module: 'AUTHENTICATION',
                    entity: 'REFRESH_TOKEN',
                    entityId: validatedToken.token.id,
                    action: 'LOGOUT',
                    newValues: {
                        allRefreshTokensRevoked: true,
                        revokedCount: revoked.count,
                    },
                },
            });
        });
    }
    async cleanupExpiredTokens() {
        await this.refreshTokenRepository.cleanupExpired(new Date());
    }
    async findMatchingToken(records, refreshToken) {
        for (const record of records) {
            if (await this.passwordService.compare(refreshToken, record.tokenHash)) {
                return record;
            }
        }
    }
    isUserActive(user) {
        return (!user.isDeleted &&
            !user.deletedAt &&
            user.status === client_1.UserStatus.ACTIVE &&
            (!user.lockedUntil || user.lockedUntil <= new Date()));
    }
    getExpiryDate() {
        const value = this.configService.getOrThrow('jwt.refreshExpiresIn');
        const match = /^(\d+)(s|m|h|d)$/.exec(value);
        if (!match) {
            throw new Error('JWT_REFRESH_EXPIRES_IN must use a number followed by s, m, h, or d.');
        }
        const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
        const multiplier = multipliers[match[2]];
        return new Date(Date.now() + Number(match[1]) * multiplier);
    }
    async createAuditLog(userId, action, newValues) {
        await this.prisma.auditLog.create({
            data: {
                userId,
                module: 'AUTHENTICATION',
                entity: 'REFRESH_TOKEN',
                action,
                newValues,
            },
        });
    }
};
exports.RefreshTokenService = RefreshTokenService;
exports.RefreshTokenService = RefreshTokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        password_service_1.PasswordService,
        refresh_token_repository_service_1.RefreshTokenRepositoryService])
], RefreshTokenService);
//# sourceMappingURL=refresh-token.service.js.map