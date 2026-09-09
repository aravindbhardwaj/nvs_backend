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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const throttler_1 = require("@nestjs/throttler");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const capture_visit_dto_1 = require("./dto/capture-visit.dto");
const visitor_report_query_dto_1 = require("./dto/visitor-report-query.dto");
const visitor_analytics_service_1 = require("./visitor-analytics.service");
let VisitorAnalyticsController = class VisitorAnalyticsController {
    visitorAnalyticsService;
    constructor(visitorAnalyticsService) {
        this.visitorAnalyticsService = visitorAnalyticsService;
    }
    async captureVisit(dto) {
        await this.visitorAnalyticsService.captureVisit(dto);
        return { message: 'Visitor activity captured successfully.', data: {} };
    }
    async report(query) {
        return {
            message: 'Visitor analytics retrieved successfully.',
            data: await this.visitorAnalyticsService.report(query),
        };
    }
};
exports.VisitorAnalyticsController = VisitorAnalyticsController;
__decorate([
    (0, common_1.Post)('visit'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, throttler_1.Throttle)({
        default: {
            ttl: Number(process.env.VISITOR_RATE_LIMIT_TTL_MS ?? 60_000),
            limit: Number(process.env.VISITOR_RATE_LIMIT_MAX_REQUESTS ?? 100),
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [capture_visit_dto_1.CaptureVisitDto]),
    __metadata("design:returntype", Promise)
], VisitorAnalyticsController.prototype, "captureVisit", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, require_permission_decorator_1.RequirePermission)('VISITOR_ANALYTICS_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [visitor_report_query_dto_1.VisitorReportQueryDto]),
    __metadata("design:returntype", Promise)
], VisitorAnalyticsController.prototype, "report", null);
exports.VisitorAnalyticsController = VisitorAnalyticsController = __decorate([
    (0, common_1.Controller)('api/visitor-analytics'),
    __metadata("design:paramtypes", [visitor_analytics_service_1.VisitorAnalyticsService])
], VisitorAnalyticsController);
//# sourceMappingURL=visitor-analytics.controller.js.map