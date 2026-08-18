import { Controller, Get } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { VisitorAnalyticsService } from './visitor-analytics.service';

@Public()
@Controller('api/public')
export class PublicVisitorAnalyticsController {
  constructor(private readonly visitorAnalytics: VisitorAnalyticsService) {}

  @Get('visitor-count')
  @Public()
  async visitorCount() {
    return {
      message: 'Visitor count retrieved successfully.',
      data: await this.visitorAnalytics.publicCount(),
    };
  }
}
