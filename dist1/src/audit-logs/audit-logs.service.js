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
exports.AuditLogsService = void 0;
const common_1 = require("@nestjs/common");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditLogsService = class AuditLogsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input) {
        await this.prisma.auditLog.create({ data: input });
    }
    async findAll(query) {
        const where = {
            ...(query.module
                ? { module: { equals: query.module, mode: 'insensitive' } }
                : {}),
            ...(query.userId ? { userId: query.userId } : {}),
            ...(query.action
                ? { action: { equals: query.action, mode: 'insensitive' } }
                : {}),
            ...(query.dateFrom || query.dateTo
                ? {
                    createdAt: {
                        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
                        ...(query.dateTo
                            ? { lte: new Date(`${query.dateTo}T23:59:59.999Z`) }
                            : {}),
                    },
                }
                : {}),
        };
        if (query.search?.trim()) {
            const search = query.search.trim();
            where.OR = [
                { module: { contains: search, mode: 'insensitive' } },
                { entity: { contains: search, mode: 'insensitive' } },
                { action: { contains: search, mode: 'insensitive' } },
                {
                    user: {
                        is: {
                            OR: [
                                { name: { contains: search, mode: 'insensitive' } },
                                { email: { contains: search, mode: 'insensitive' } },
                            ],
                        },
                    },
                },
            ];
        }
        const [items, totalItems] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({
                where,
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: query.order },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            items,
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findOne(id) {
        const auditLog = await this.prisma.auditLog.findUnique({
            where: { id },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        if (!auditLog)
            throw new common_1.NotFoundException('Audit log not found.');
        return auditLog;
    }
};
exports.AuditLogsService = AuditLogsService;
exports.AuditLogsService = AuditLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogsService);
//# sourceMappingURL=audit-logs.service.js.map