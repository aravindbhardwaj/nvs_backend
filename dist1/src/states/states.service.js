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
exports.StatesService = void 0;
const common_1 = require("@nestjs/common");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
let StatesService = class StatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page, limit, search, ro_id, sort, order } = query;
        const where = {
            isActive: true,
            isDeleted: false,
            ...(ro_id !== undefined ? { roId: ro_id } : {}),
            ...(search?.trim()
                ? {
                    OR: [
                        {
                            stateName: { contains: search.trim(), mode: 'insensitive' },
                        },
                        {
                            stateCode: { contains: search.trim(), mode: 'insensitive' },
                        },
                        { isoCode: { contains: search.trim(), mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const orderBy = { [sort]: order };
        const [states, totalItems] = await this.prisma.$transaction([
            this.prisma.state.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.state.count({ where }),
        ]);
        return {
            items: states.map((state) => this.toResponse(state)),
            meta: pagination_util_1.PaginationUtil.buildMeta(page, limit, totalItems),
        };
    }
    toResponse(state) {
        return {
            id: state.id,
            stateName: state.stateName,
            nameHi: state.nameHi,
            stateCode: state.stateCode,
            isActive: state.isActive,
            roId: state.roId,
            isoCode: state.isoCode,
        };
    }
};
exports.StatesService = StatesService;
exports.StatesService = StatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatesService);
//# sourceMappingURL=states.service.js.map