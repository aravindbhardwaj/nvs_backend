import { Controller, Get, Query } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { VisitorCountQueryDto } from './dto/visitor-count-query.dto';
import { VisitorAnalyticsService } from './visitor-analytics.service';

@Public()
@Controller('api/public')
export class PublicVisitorAnalyticsController {
  constructor(private readonly visitorAnalytics: VisitorAnalyticsService) {}

  @Get('visitor-count')
  @Public()
  async visitorCount(@Query() query: VisitorCountQueryDto) {
    return {
      message: 'Visitor count retrieved successfully.',
      data: await this.visitorAnalytics.publicCount(query.organization_id),
    };
  }
}
