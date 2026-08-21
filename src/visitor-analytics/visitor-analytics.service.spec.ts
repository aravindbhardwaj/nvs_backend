import { BadRequestException } from '@nestjs/common';

import { VisitorAnalyticsService } from './visitor-analytics.service';

describe('VisitorAnalyticsService', () => {
  const prisma = {
    organization: { findFirst: jest.fn() },
    visitorSession: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  const service = new VisitorAnalyticsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.organization.findFirst.mockResolvedValue({ id: 1 });
  });

  it('upserts an anonymous English session for its organization', async () => {
    await service.captureVisit({
      organization_id: 1,
      visitor_id: '550e8400-e29b-41d4-a716-446655440000',
      session_id: 'c9402758-75b1-4cd9-a398-c833ed01907a',
      language: 1,
    });

    expect(prisma.visitorSession.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId_sessionId: {
            organizationId: 1,
            sessionId: 'c9402758-75b1-4cd9-a398-c833ed01907a',
          },
        },
        create: expect.objectContaining({
          organizationId: 1,
          visitorId: '550e8400-e29b-41d4-a716-446655440000',
          usedEnglish: true,
          usedHindi: false,
        }),
      }),
    );
  });

  it('updates language activity for an existing session without creating another visit', async () => {
    await service.captureVisit({
      organization_id: 1,
      visitor_id: '550e8400-e29b-41d4-a716-446655440000',
      session_id: 'c9402758-75b1-4cd9-a398-c833ed01907a',
      language: 2,
    });

    expect(prisma.visitorSession.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ usedHindi: true }),
      }),
    );
  });

  it('returns the number of recorded sessions for one organization publicly', async () => {
    prisma.visitorSession.count.mockResolvedValue(2);

    await expect(service.publicCount(1)).resolves.toEqual({ total_visits: 2 });
    expect(prisma.visitorSession.count).toHaveBeenCalledWith({
      where: { organizationId: 1 },
    });
  });

  it('reports sessions, unique visitors, bilingual activity, and daily breakdowns', async () => {
    prisma.visitorSession.findMany.mockResolvedValue([
      {
        visitorId: 'visitor-a',
        startedAt: new Date('2026-01-01T10:00:00.000Z'),
        usedEnglish: true,
        usedHindi: true,
      },
      {
        visitorId: 'visitor-a',
        startedAt: new Date('2026-01-02T10:00:00.000Z'),
        usedEnglish: true,
        usedHindi: false,
      },
      {
        visitorId: 'visitor-b',
        startedAt: new Date('2026-01-02T11:00:00.000Z'),
        usedEnglish: false,
        usedHindi: true,
      },
    ]);

    await expect(
      service.report({ from_date: '2026-01-01', to_date: '2026-01-03' }),
    ).resolves.toEqual({
      summary: {
        from_date: '2026-01-01',
        to_date: '2026-01-03',
        total_visits: 3,
        unique_visitors: 2,
        english_visits: 2,
        hindi_visits: 2,
      },
      daily: [
        {
          date: '2026-01-01',
          total_visits: 1,
          unique_visitors: 1,
          english_visits: 1,
          hindi_visits: 1,
        },
        {
          date: '2026-01-02',
          total_visits: 2,
          unique_visitors: 2,
          english_visits: 1,
          hindi_visits: 1,
        },
        {
          date: '2026-01-03',
          total_visits: 0,
          unique_visitors: 0,
          english_visits: 0,
          hindi_visits: 0,
        },
      ],
    });
  });

  it('rejects invalid date ranges before querying analytics data', async () => {
    await expect(
      service.report({ from_date: '2026-01-02', to_date: '2026-01-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.visitorSession.findMany).not.toHaveBeenCalled();
  });

  it('filters reports by organization when organization_id is supplied', async () => {
    prisma.visitorSession.findMany.mockResolvedValue([]);

    await service.report({
      from_date: '2026-01-01',
      to_date: '2026-01-01',
      organization_id: 1,
    });

    expect(prisma.visitorSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: 1 }),
      }),
    );
  });
});
