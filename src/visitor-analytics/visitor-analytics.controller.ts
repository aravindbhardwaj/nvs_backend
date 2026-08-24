import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { Public } from '../auth/decorators/public.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CaptureVisitDto } from './dto/capture-visit.dto';
import { VisitorReportQueryDto } from './dto/visitor-report-query.dto';
import { VisitorAnalyticsService } from './visitor-analytics.service';

@Controller('api/visitor-analytics')
export class VisitorAnalyticsController {
  constructor(
    private readonly visitorAnalyticsService: VisitorAnalyticsService,
  ) {}

  @Post('visit')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      ttl: Number(process.env.VISITOR_RATE_LIMIT_TTL_MS ?? 60_000),
      limit: Number(process.env.VISITOR_RATE_LIMIT_MAX_REQUESTS ?? 100),
    },
  })
  async captureVisit(@Body() dto: CaptureVisitDto) {
    await this.visitorAnalyticsService.captureVisit(dto);
    return { message: 'Visitor activity captured successfully.', data: {} };
  }

  @Get('report')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('VISITOR_ANALYTICS_VIEW')
  async report(@Query() query: VisitorReportQueryDto) {
    return {
      message: 'Visitor analytics retrieved successfully.',
      data: await this.visitorAnalyticsService.report(query),
    };
  }
}
