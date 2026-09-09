import { PrismaService } from '../prisma/prisma.service';
import { CaptureVisitDto } from './dto/capture-visit.dto';
import { VisitorAnalyticsReportDto } from './dto/visitor-analytics-response.dto';
import { VisitorReportQueryDto } from './dto/visitor-report-query.dto';
export declare class VisitorAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    captureVisit(dto: CaptureVisitDto): Promise<void>;
    report(query: VisitorReportQueryDto): Promise<VisitorAnalyticsReportDto>;
    publicCount(organizationId: number): Promise<{
        total_visits: number;
    }>;
    private ensureActiveOrganization;
    private assertValidDateRange;
    private initializeDaily;
}
