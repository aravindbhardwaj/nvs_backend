import { PageStatus } from '@prisma/client';

import { PagesService } from './pages.service';

describe('PagesService public queries', () => {
  const prisma = {
    page: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  const service = new PagesService(prisma as never, {} as never);

  beforeEach(() => jest.clearAllMocks());

  it('queries only published, non-deleted, date-valid pages', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.findPublic({
      page: 1,
      limit: 20,
      organization_id: 28,
      content_type_id: 5,
    });

    expect(prisma.page.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isDeleted: false,
          status: PageStatus.PUBLISHED,
          organizationId: 28,
          contentTypeId: 5,
          AND: expect.any(Array),
        }),
      }),
    );
  });

  it('applies the same public eligibility rules to slug lookup', async () => {
    prisma.page.findFirst.mockResolvedValue(null);

    await expect(service.findPublicBySlug('vision')).rejects.toThrow(
      'Public page not found.',
    );
    expect(prisma.page.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          slug: 'vision',
          isDeleted: false,
          status: PageStatus.PUBLISHED,
          AND: expect.any(Array),
        }),
      }),
    );
  });
});
