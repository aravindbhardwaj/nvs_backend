import { Role } from '@prisma/client';
import { ThrottlerGuard } from '@nestjs/throttler';

import { IS_PUBLIC_KEY } from '../auth/decorators/public.decorator';
import { REQUIRED_PERMISSIONS_KEY } from '../auth/decorators/require-permission.decorator';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { VisitorAnalyticsController } from './visitor-analytics.controller';
import { PublicVisitorAnalyticsController } from './public-visitor-analytics.controller';

describe('VisitorAnalyticsController', () => {
  it('keeps capture public and limits reports to SUPER_ADMIN with analytics permission', () => {
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        VisitorAnalyticsController.prototype.captureVisit,
      ),
    ).toBe(true);
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        VisitorAnalyticsController.prototype.report,
      ),
    ).toEqual([Role.SUPER_ADMIN]);
    expect(
      Reflect.getMetadata(
        REQUIRED_PERMISSIONS_KEY,
        VisitorAnalyticsController.prototype.report,
      ),
    ).toEqual(['VISITOR_ANALYTICS_VIEW']);
    expect(
      Reflect.getMetadata(
        '__guards__',
        VisitorAnalyticsController.prototype.captureVisit,
      ),
    ).toContain(ThrottlerGuard);
    expect(
      Reflect.getMetadata(
        'THROTTLER:LIMITdefault',
        VisitorAnalyticsController.prototype.captureVisit,
      ),
    ).toBe(100);
    expect(
      Reflect.getMetadata(
        'THROTTLER:TTLdefault',
        VisitorAnalyticsController.prototype.captureVisit,
      ),
    ).toBe(60_000);
  });

  it('marks the aggregate visitor counter as public', () => {
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        PublicVisitorAnalyticsController.prototype.visitorCount,
      ),
    ).toBe(true);
  });
});
