import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { VisitorAnalyticsController } from './visitor-analytics.controller';
import { VisitorAnalyticsService } from './visitor-analytics.service';

@Module({
  imports: [AuthModule],
  controllers: [VisitorAnalyticsController],
  providers: [VisitorAnalyticsService],
})
export class VisitorAnalyticsModule {}
