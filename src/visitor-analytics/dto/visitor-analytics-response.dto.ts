export class VisitorAnalyticsSummaryDto {
  from_date: string;
  to_date: string;
  total_visits: number;
  unique_visitors: number;
  english_visits: number;
  hindi_visits: number;
}

export class VisitorAnalyticsDailyDto {
  date: string;
  total_visits: number;
  unique_visitors: number;
  english_visits: number;
  hindi_visits: number;
}

export class VisitorAnalyticsReportDto {
  summary: VisitorAnalyticsSummaryDto;
  daily: VisitorAnalyticsDailyDto[];
}
