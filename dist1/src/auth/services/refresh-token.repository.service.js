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
exports.RefreshTokenRepositoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RefreshTokenRepositoryService = class RefreshTokenRepositoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.refreshToken.findMany({
            include: {
                user: { include: { organizationType: { select: { code: true } } } },
            },
        });
    }
    create(data) {
        return this.prisma.refreshToken.create({ data });
    }
    async revoke(id, revokedAt) {
        const result = await this.prisma.refreshToken.updateMany({
            where: { id, revokedAt: null },
            data: { revokedAt },
        });
        return result.count === 1;
    }
    cleanupExpired(now) {
        return this.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: now } },
        });
    }
};
exports.RefreshTokenRepositoryService = RefreshTokenRepositoryService;
exports.RefreshTokenRepositoryService = RefreshTokenRepositoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RefreshTokenRepositoryService);
//# sourceMappingURL=refresh-token.repository.service.js.map