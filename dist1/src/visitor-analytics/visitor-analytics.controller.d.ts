import { CaptureVisitDto } from './dto/capture-visit.dto';
import { VisitorReportQueryDto } from './dto/visitor-report-query.dto';
import { VisitorAnalyticsService } from './visitor-analytics.service';
export declare class VisitorAnalyticsController {
    private readonly visitorAnalyticsService;
    constructor(visitorAnalyticsService: VisitorAnalyticsService);
    captureVisit(dto: CaptureVisitDto): Promise<{
        message: string;
        data: {};
    }>;
    report(query: VisitorReportQueryDto): Promise<{
        message: string;
        data: import("./dto/visitor-analytics-response.dto").VisitorAnalyticsReportDto;
    }>;
}
