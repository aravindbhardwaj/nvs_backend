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
exports.VisitorAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const calendar_date_util_1 = require("../common/utils/calendar-date.util");
const prisma_service_1 = require("../prisma/prisma.service");
const visitor_analytics_constants_1 = require("./visitor-analytics.constants");
let VisitorAnalyticsService = class VisitorAnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async captureVisit(dto) {
        await this.ensureActiveOrganization(dto.organization_id);
        const now = new Date();
        const usesEnglish = dto.language === visitor_analytics_constants_1.VISITOR_LANGUAGE.ENGLISH;
        await this.prisma.visitorSession.upsert({
            where: {
                organizationId_sessionId: {
                    organizationId: dto.organization_id,
                    sessionId: dto.session_id,
                },
            },
            update: {
                lastActivityAt: now,
                ...(usesEnglish ? { usedEnglish: true } : { usedHindi: true }),
            },
            create: {
                organizationId: dto.organization_id,
                visitorId: dto.visitor_id,
                sessionId: dto.session_id,
                usedEnglish: usesEnglish,
                usedHindi: !usesEnglish,
                startedAt: now,
                lastActivityAt: now,
            },
        });
    }
    async report(query) {
        this.assertValidDateRange(query);
        const fromDate = (0, calendar_date_util_1.toCalendarDate)(query.from_date);
        const toDateExclusive = (0, calendar_date_util_1.toCalendarDate)(query.to_date);
        toDateExclusive.setUTCDate(toDateExclusive.getUTCDate() + 1);
        const sessions = await this.prisma.visitorSession.findMany({
            where: {
                startedAt: { gte: fromDate, lt: toDateExclusive },
                ...(query.organization_id
                    ? { organizationId: query.organization_id }
                    : {}),
            },
            select: {
                visitorId: true,
                startedAt: true,
                usedEnglish: true,
                usedHindi: true,
            },
            orderBy: { startedAt: 'asc' },
        });
        const daily = this.initializeDaily(query.from_date, query.to_date);
        const visitors = new Set();
        let englishVisits = 0;
        let hindiVisits = 0;
        for (const session of sessions) {
            visitors.add(session.visitorId);
            if (session.usedEnglish)
                englishVisits += 1;
            if (session.usedHindi)
                hindiVisits += 1;
            const day = daily.get((0, calendar_date_util_1.formatCalendarDate)(session.startedAt));
            if (!day)
                continue;
            day.total_visits += 1;
            day.visitors.add(session.visitorId);
            if (session.usedEnglish)
                day.english_visits += 1;
            if (session.usedHindi)
                day.hindi_visits += 1;
        }
        return {
            summary: {
                from_date: query.from_date,
                to_date: query.to_date,
                total_visits: sessions.length,
                unique_visitors: visitors.size,
                english_visits: englishVisits,
                hindi_visits: hindiVisits,
            },
            daily: [...daily.values()].map(({ visitors, ...item }) => ({
                ...item,
                unique_visitors: visitors.size,
            })),
        };
    }
    async publicCount(organizationId) {
        await this.ensureActiveOrganization(organizationId);
        return {
            total_visits: await this.prisma.visitorSession.count({
                where: { organizationId },
            }),
        };
    }
    async ensureActiveOrganization(id) {
        const organization = await this.prisma.organization.findFirst({
            where: { id, isDeleted: false },
            select: { id: true },
        });
        if (!organization)
            throw new common_1.NotFoundException('Organization not found.');
    }
    assertValidDateRange(query) {
        const fromDate = (0, calendar_date_util_1.toCalendarDate)(query.from_date);
        const toDate = (0, calendar_date_util_1.toCalendarDate)(query.to_date);
        if ((0, calendar_date_util_1.formatCalendarDate)(fromDate) !== query.from_date ||
            (0, calendar_date_util_1.formatCalendarDate)(toDate) !== query.to_date ||
            (0, calendar_date_util_1.isInvalidDateRange)(query.from_date, query.to_date))
            throw new common_1.BadRequestException('from_date and to_date must be valid calendar dates with to_date on or after from_date.');
    }
    initializeDaily(fromDate, toDate) {
        const daily = new Map();
        const current = (0, calendar_date_util_1.toCalendarDate)(fromDate);
        const end = (0, calendar_date_util_1.toCalendarDate)(toDate);
        while (current <= end) {
            const date = (0, calendar_date_util_1.formatCalendarDate)(current);
            daily.set(date, {
                date,
                total_visits: 0,
                unique_visitors: 0,
                english_visits: 0,
                hindi_visits: 0,
                visitors: new Set(),
            });
            current.setUTCDate(current.getUTCDate() + 1);
        }
        return daily;
    }
};
exports.VisitorAnalyticsService = VisitorAnalyticsService;
exports.VisitorAnalyticsService = VisitorAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VisitorAnalyticsService);
//# sourceMappingURL=visitor-analytics.service.js.map