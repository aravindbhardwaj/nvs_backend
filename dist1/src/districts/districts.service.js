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
exports.DistrictsService = void 0;
const common_1 = require("@nestjs/common");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
let DistrictsService = class DistrictsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page, limit, search, stateId, roId, isActive, sort, order } = query;
        const where = {
            isActive,
            ...(stateId !== undefined ? { stateId } : {}),
            ...(roId !== undefined ? { roId } : {}),
            ...(search?.trim()
                ? {
                    OR: [
                        {
                            districtName: { contains: search.trim(), mode: 'insensitive' },
                        },
                        {
                            districtCode: { contains: search.trim(), mode: 'insensitive' },
                        },
                    ],
                }
                : {}),
        };
        const orderBy = { [sort]: order };
        const [districts, totalItems] = await this.prisma.$transaction([
            this.prisma.district.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.district.count({ where }),
        ]);
        return {
            items: districts.map((district) => this.toResponse(district)),
            meta: pagination_util_1.PaginationUtil.buildMeta(page, limit, totalItems),
        };
    }
    toResponse(district) {
        return {
            id: district.id,
            districtName: district.districtName,
            nameHi: district.nameHi,
            districtCode: district.districtCode,
            stateId: district.stateId,
            isActive: district.isActive,
            languageId: district.languageId,
            oldDistrictCode: district.oldDistrictCode,
            oldDistrictName: district.oldDistrictName,
            roId: district.roId,
            createdAt: district.createdAt,
            updatedAt: district.updatedAt,
        };
    }
};
exports.DistrictsService = DistrictsService;
exports.DistrictsService = DistrictsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DistrictsService);
//# sourceMappingURL=districts.service.js.map