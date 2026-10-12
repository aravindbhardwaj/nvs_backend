import {
  PageStatus,
  PageSynchronizationItemStatus,
  PageSynchronizationStatus,
} from '@prisma/client';

import { PageSynchronizationService } from './page-synchronization.service';

describe('PageSynchronizationService', () => {
  const menuFindMany = jest.fn();
  const itemUpdate = jest.fn();
  const itemUpdateMany = jest.fn();
  const itemFindMany = jest.fn();
  const jobUpdate = jest.fn();
  const jobUpdateMany = jest.fn();
  const jobFindFirst = jest.fn();
  const pageFindMany = jest.fn();
  const pageCreateMany = jest.fn();
  const transaction = jest.fn();
  const prisma = {
    menu: { findMany: menuFindMany },
    pageSynchronizationJob: {
      update: jobUpdate,
      updateMany: jobUpdateMany,
      findFirst: jobFindFirst,
    },
    pageSynchronizationItem: {
      update: itemUpdate,
      updateMany: itemUpdateMany,
      findMany: itemFindMany,
    },
    $transaction: transaction,
  };
  const service = new PageSynchronizationService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses active local menus with non-deleted content types and deduplicates content types', async () => {
    menuFindMany.mockResolvedValue([
      {
        contentTypeId: 5,
        titleEnglish: 'About Us',
        titleHindi: 'हमारे बारे में',
        display_order: 1,
      },
      {
        contentTypeId: 5,
        titleEnglish: 'Duplicate About',
        titleHindi: null,
        display_order: 2,
      },
      {
        contentTypeId: 6,
        titleEnglish: 'Vision',
        titleHindi: null,
        display_order: 3,
      },
    ]);

    const templates = await privateService().getTemplates(3);

    expect(menuFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationTypeId: 3,
          contentTypeId: { not: null },
          contentType: { isDeleted: false },
          isActive: true,
          isDeleted: false,
        },
      }),
    );
    expect(templates).toHaveLength(2);
    expect(templates[0]).toEqual(
      expect.objectContaining({
        contentTypeId: 5,
        titleEnglish: 'About Us',
      }),
    );
  });

  it('commits missing draft pages and the organization result atomically', async () => {
    const txItemUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const txItemUpdate = jest.fn().mockResolvedValue({});
    const txJobUpdate = jest.fn().mockResolvedValue({});
    pageFindMany.mockResolvedValue([{ contentTypeId: 5 }]);
    pageCreateMany.mockResolvedValue({ count: 1 });
    transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        pageSynchronizationItem: {
          updateMany: txItemUpdateMany,
          update: txItemUpdate,
        },
        pageSynchronizationJob: { update: txJobUpdate },
        page: { findMany: pageFindMany, createMany: pageCreateMany },
      }),
    );

    await privateService().processItem(
      7,
      10,
      { id: 20, uuid: '00000000-0000-4000-8000-000000000020' },
      [template(5, 'Existing', 1), template(6, 'Vision', 2, 'दृष्टि')],
      30,
    );

    expect(pageCreateMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          organizationId: 20,
          contentTypeId: 6,
          titleEnglish: 'Vision',
          titleHindi: 'दृष्टि',
          status: PageStatus.DRAFT,
          createdById: 30,
          updatedById: 30,
        }),
      ],
      skipDuplicates: true,
    });
    expect(txItemUpdate).toHaveBeenCalledWith({
      where: { id: 10 },
      data: expect.objectContaining({
        status: PageSynchronizationItemStatus.COMPLETED,
        createdPages: 1,
        skippedPages: 1,
      }),
    });
    expect(txJobUpdate).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { updatedAt: expect.any(Date) },
    });
  });

  it('records an organization failure when its page transaction fails', async () => {
    transaction.mockRejectedValue(new Error('Database unavailable'));
    itemUpdate.mockResolvedValue({});

    await privateService().processItem(
      7,
      10,
      { id: 20, uuid: '00000000-0000-4000-8000-000000000020' },
      [template(5, 'About Us', 1)],
      30,
    );

    expect(itemUpdate).toHaveBeenCalledWith({
      where: { id: 10 },
      data: expect.objectContaining({
        status: PageSynchronizationItemStatus.FAILED,
        errorMessage: 'Database unavailable',
      }),
    });
  });

  it('recovers only stale running jobs and organization items', async () => {
    itemUpdateMany.mockResolvedValue({ count: 1 });
    jobUpdateMany.mockResolvedValue({ count: 1 });
    transaction.mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );

    await privateService().recoverStaleJobs();

    expect(itemUpdateMany).toHaveBeenCalledWith({
      where: {
        status: PageSynchronizationItemStatus.RUNNING,
        updatedAt: { lt: expect.any(Date) },
      },
      data: expect.objectContaining({
        status: PageSynchronizationItemStatus.PENDING,
      }),
    });
    expect(jobUpdateMany).toHaveBeenCalledWith({
      where: {
        status: PageSynchronizationStatus.RUNNING,
        updatedAt: { lt: expect.any(Date) },
      },
      data: expect.objectContaining({
        status: PageSynchronizationStatus.PENDING,
        workerLock: null,
      }),
    });
  });

  it('claims a pending job with the global worker lock', async () => {
    jobFindFirst.mockResolvedValue({ id: 44 });
    jobUpdateMany.mockResolvedValue({ count: 1 });

    await expect(privateService().claimNextJob()).resolves.toBe(44);

    expect(jobUpdateMany).toHaveBeenCalledWith({
      where: {
        id: 44,
        status: PageSynchronizationStatus.PENDING,
        workerLock: null,
      },
      data: expect.objectContaining({
        status: PageSynchronizationStatus.RUNNING,
        workerLock: 1,
      }),
    });
  });

  it('recomputes final counters from durable organization results', async () => {
    itemFindMany.mockResolvedValue([
      {
        status: PageSynchronizationItemStatus.COMPLETED,
        createdPages: 3,
        skippedPages: 1,
      },
      {
        status: PageSynchronizationItemStatus.FAILED,
        createdPages: 0,
        skippedPages: 0,
      },
    ]);
    jobUpdate.mockResolvedValue({});

    await privateService().completeJob(7);

    expect(jobUpdate).toHaveBeenCalledWith({
      where: { id: 7 },
      data: expect.objectContaining({
        status: PageSynchronizationStatus.COMPLETED_WITH_ERRORS,
        processedOrganizations: 2,
        createdPages: 3,
        skippedPages: 1,
        failedOrganizations: 1,
        workerLock: null,
      }),
    });
  });

  it('creates an automatic job only for supported organization types', async () => {
    const jobCreate = jest.fn().mockResolvedValue({ id: 90 });
    const tx = { pageSynchronizationJob: { create: jobCreate } };

    await expect(
      service.createForNewOrganization(
        tx as never,
        {
          id: 20,
          organizationTypeId: 3,
          organizationType: { code: 'REGIONAL_OFFICE' },
        },
        30,
      ),
    ).resolves.toBe(90);
    await expect(
      service.createForNewOrganization(
        tx as never,
        {
          id: 1,
          organizationTypeId: 1,
          organizationType: { code: 'HEADQUARTER' },
        },
        30,
      ),
    ).resolves.toBeNull();
    expect(jobCreate).toHaveBeenCalledTimes(1);
  });

  function template(
    contentTypeId: number,
    titleEnglish: string,
    displayOrder: number,
    titleHindi: string | null = null,
  ) {
    return { contentTypeId, titleEnglish, titleHindi, displayOrder };
  }

  function privateService() {
    return service as unknown as {
      getTemplates: (organizationTypeId: number) => Promise<unknown[]>;
      processItem: (
        jobId: number,
        itemId: number,
        organization: { id: number; uuid: string },
        templates: ReturnType<typeof template>[],
        requestedById: number,
      ) => Promise<void>;
      recoverStaleJobs: () => Promise<void>;
      claimNextJob: () => Promise<number | null>;
      completeJob: (jobId: number) => Promise<void>;
    };
  }
});
