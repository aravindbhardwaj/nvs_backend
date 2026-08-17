import { BadRequestException, Injectable } from '@nestjs/common';

import {
  formatCalendarDate,
  isInvalidDateRange,
  toCalendarDate,
} from '../common/utils/calendar-date.util';
import { PrismaService } from '../prisma/prisma.service';
import { CaptureVisitDto } from './dto/capture-visit.dto';
import {
  VisitorAnalyticsDailyDto,
  VisitorAnalyticsReportDto,
} from './dto/visitor-analytics-response.dto';
import { VisitorReportQueryDto } from './dto/visitor-report-query.dto';
import { VISITOR_LANGUAGE } from './visitor-analytics.constants';

@Injectable()
export class VisitorAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async captureVisit(dto: CaptureVisitDto): Promise<void> {
    const now = new Date();
    const usesEnglish = dto.language === VISITOR_LANGUAGE.ENGLISH;

    await this.prisma.visitorSession.upsert({
      where: { sessionId: dto.session_id },
      update: {
        lastActivityAt: now,
        ...(usesEnglish ? { usedEnglish: true } : { usedHindi: true }),
      },
      create: {
        visitorId: dto.visitor_id,
        sessionId: dto.session_id,
        usedEnglish: usesEnglish,
        usedHindi: !usesEnglish,
        startedAt: now,
        lastActivityAt: now,
      },
    });
  }

  async report(
    query: VisitorReportQueryDto,
  ): Promise<VisitorAnalyticsReportDto> {
    this.assertValidDateRange(query);
    const fromDate = toCalendarDate(query.from_date);
    const toDateExclusive = toCalendarDate(query.to_date);
    toDateExclusive.setUTCDate(toDateExclusive.getUTCDate() + 1);

    const sessions = await this.prisma.visitorSession.findMany({
      where: { startedAt: { gte: fromDate, lt: toDateExclusive } },
      select: {
        visitorId: true,
        startedAt: true,
        usedEnglish: true,
        usedHindi: true,
      },
      orderBy: { startedAt: 'asc' },
    });

    const daily = this.initializeDaily(query.from_date, query.to_date);
    const visitors = new Set<string>();
    let englishVisits = 0;
    let hindiVisits = 0;

    for (const session of sessions) {
      visitors.add(session.visitorId);
      if (session.usedEnglish) englishVisits += 1;
      if (session.usedHindi) hindiVisits += 1;

      const day = daily.get(formatCalendarDate(session.startedAt)!);
      if (!day) continue;
      day.total_visits += 1;
      day.visitors.add(session.visitorId);
      if (session.usedEnglish) day.english_visits += 1;
      if (session.usedHindi) day.hindi_visits += 1;
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

  private assertValidDateRange(query: VisitorReportQueryDto): void {
    const fromDate = toCalendarDate(query.from_date);
    const toDate = toCalendarDate(query.to_date);
    if (
      formatCalendarDate(fromDate) !== query.from_date ||
      formatCalendarDate(toDate) !== query.to_date ||
      isInvalidDateRange(query.from_date, query.to_date)
    )
      throw new BadRequestException(
        'from_date and to_date must be valid calendar dates with to_date on or after from_date.',
      );
  }

  private initializeDaily(fromDate: string, toDate: string) {
    const daily = new Map<
      string,
      VisitorAnalyticsDailyDto & { visitors: Set<string> }
    >();
    const current = toCalendarDate(fromDate);
    const end = toCalendarDate(toDate);
    while (current <= end) {
      const date = formatCalendarDate(current)!;
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
}
