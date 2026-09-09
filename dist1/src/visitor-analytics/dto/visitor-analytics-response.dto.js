"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorAnalyticsReportDto = exports.VisitorAnalyticsDailyDto = exports.VisitorAnalyticsSummaryDto = void 0;
class VisitorAnalyticsSummaryDto {
    from_date;
    to_date;
    total_visits;
    unique_visitors;
    english_visits;
    hindi_visits;
}
exports.VisitorAnalyticsSummaryDto = VisitorAnalyticsSummaryDto;
class VisitorAnalyticsDailyDto {
    date;
    total_visits;
    unique_visitors;
    english_visits;
    hindi_visits;
}
exports.VisitorAnalyticsDailyDto = VisitorAnalyticsDailyDto;
class VisitorAnalyticsReportDto {
    summary;
    daily;
}
exports.VisitorAnalyticsReportDto = VisitorAnalyticsReportDto;
//# sourceMappingURL=visitor-analytics-response.dto.js.map