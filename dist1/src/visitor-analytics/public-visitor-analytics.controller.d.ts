import { VisitorCountQueryDto } from './dto/visitor-count-query.dto';
import { VisitorAnalyticsService } from './visitor-analytics.service';
export declare class PublicVisitorAnalyticsController {
    private readonly visitorAnalytics;
    constructor(visitorAnalytics: VisitorAnalyticsService);
    visitorCount(query: VisitorCountQueryDto): Promise<{
        message: string;
        data: {
            total_visits: number;
        };
    }>;
}
