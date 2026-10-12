import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  PageStatus,
  PageSynchronizationItemStatus,
  PageSynchronizationScope,
  PageSynchronizationStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

const SUPPORTED_ORGANIZATION_TYPES = ['REGIONAL_OFFICE', 'NLI', 'JNV'] as const;
const POLL_INTERVAL_MS = 5_000;
const STALE_JOB_MS = 10 * 60 * 1_000;

type PageTemplate = {
  contentTypeId: number;
  titleEnglish: string;
  titleHindi: string | null;
  displayOrder: number;
};

@Injectable()
export class PageSynchronizationService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PageSynchronizationService.name);
  private poller?: NodeJS.Timeout;
  private workerActive = false;
  private drainScheduled = false;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.recoverStaleJobs();
    this.kick();
    this.poller = setInterval(() => {
      void this.poll().catch((error: unknown) =>
        this.logger.error(
          'Page synchronization polling failed.',
          this.errorStack(error),
        ),
      );
    }, POLL_INTERVAL_MS);
    this.poller.unref();
  }

  onModuleDestroy(): void {
    if (this.poller) clearInterval(this.poller);
  }

  async enqueueOrganization(organizationUuid: string, requestedById: number) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        uuid: organizationUuid,
        isDeleted: false,
        isFunctional: true,
        organizationType: {
          code: { in: [...SUPPORTED_ORGANIZATION_TYPES] },
          isActive: true,
        },
      },
      select: { id: true, organizationTypeId: true },
    });
    if (!organization)
      throw new NotFoundException(
        'Eligible organization not found or is inactive.',
      );

    const job = await this.createJob(
      PageSynchronizationScope.ORGANIZATION,
      organization.organizationTypeId,
      [organization.id],
      requestedById,
      organization.id,
    );
    this.kick();
    return this.getJob(job.uuid);
  }

  async enqueueOrganizationType(
    organizationTypeUuid: string,
    requestedById: number,
  ) {
    const organizationType = await this.prisma.organizationType.findFirst({
      where: {
        uuid: organizationTypeUuid,
        code: { in: [...SUPPORTED_ORGANIZATION_TYPES] },
        isActive: true,
      },
      select: { id: true },
    });
    if (!organizationType)
      throw new NotFoundException(
        'Eligible organization type not found or is inactive.',
      );

    const organizations = await this.prisma.organization.findMany({
      where: {
        organizationTypeId: organizationType.id,
        isDeleted: false,
        isFunctional: true,
      },
      select: { id: true },
      orderBy: { id: 'asc' },
    });
    const job = await this.createJob(
      PageSynchronizationScope.ORGANIZATION_TYPE,
      organizationType.id,
      organizations.map((organization) => organization.id),
      requestedById,
    );
    this.kick();
    return this.getJob(job.uuid);
  }

  async createForNewOrganization(
    transaction: Prisma.TransactionClient,
    organization: {
      id: number;
      organizationTypeId: number;
      organizationType: { code: string };
    },
    requestedById: number,
  ): Promise<number | null> {
    if (!this.isSupportedType(organization.organizationType.code)) return null;
    const job = await transaction.pageSynchronizationJob.create({
      data: {
        scope: PageSynchronizationScope.ORGANIZATION,
        organizationId: organization.id,
        organizationTypeId: organization.organizationTypeId,
        totalOrganizations: 1,
        requestedById,
        items: { create: { organizationId: organization.id } },
      },
      select: { id: true },
    });
    return job.id;
  }

  schedulePendingJobs(): void {
    this.kick();
  }

  async getJob(uuid: string) {
    const job = await this.prisma.pageSynchronizationJob.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        scope: true,
        status: true,
        totalOrganizations: true,
        processedOrganizations: true,
        createdPages: true,
        skippedPages: true,
        failedOrganizations: true,
        errorMessage: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        organization: { select: { uuid: true, organizationName: true } },
        organizationType: { select: { uuid: true, code: true, name: true } },
      },
    });
    if (!job) throw new NotFoundException('Synchronization job not found.');
    return this.toJobResponse(job);
  }

  async getFailures(uuid: string) {
    const job = await this.prisma.pageSynchronizationJob.findUnique({
      where: { uuid },
      select: {
        items: {
          where: { status: PageSynchronizationItemStatus.FAILED },
          orderBy: { createdAt: 'asc' },
          select: {
            uuid: true,
            errorMessage: true,
            completedAt: true,
            organization: {
              select: {
                uuid: true,
                organizationName: true,
                organizationCode: true,
              },
            },
          },
        },
      },
    });
    if (!job) throw new NotFoundException('Synchronization job not found.');
    return job.items.map((item) => ({
      uuid: item.uuid,
      organization_uuid: item.organization.uuid,
      organization_name: item.organization.organizationName,
      organization_code: item.organization.organizationCode,
      error: item.errorMessage,
      created_at: item.completedAt,
    }));
  }

  private async createJob(
    scope: PageSynchronizationScope,
    organizationTypeId: number,
    organizationIds: number[],
    requestedById: number,
    organizationId?: number,
  ) {
    return this.prisma.pageSynchronizationJob.create({
      data: {
        scope,
        organizationId,
        organizationTypeId,
        totalOrganizations: organizationIds.length,
        requestedById,
        ...(organizationIds.length > 0
          ? {
              items: {
                createMany: {
                  data: organizationIds.map((id) => ({ organizationId: id })),
                },
              },
            }
          : {}),
      },
      select: { id: true, uuid: true },
    });
  }

  private kick(): void {
    if (this.workerActive || this.drainScheduled) return;
    this.drainScheduled = true;
    setImmediate(() => {
      this.drainScheduled = false;
      void this.drain().catch((error: unknown) =>
        this.logger.error(
          'Page synchronization worker failed.',
          this.errorStack(error),
        ),
      );
    });
  }

  private async poll(): Promise<void> {
    await this.recoverStaleJobs();
    this.kick();
  }

  private async recoverStaleJobs(): Promise<void> {
    const staleBefore = new Date(Date.now() - STALE_JOB_MS);
    await this.prisma.$transaction([
      this.prisma.pageSynchronizationItem.updateMany({
        where: {
          status: PageSynchronizationItemStatus.RUNNING,
          updatedAt: { lt: staleBefore },
        },
        data: {
          status: PageSynchronizationItemStatus.PENDING,
          startedAt: null,
          errorMessage: null,
        },
      }),
      this.prisma.pageSynchronizationJob.updateMany({
        where: {
          status: PageSynchronizationStatus.RUNNING,
          updatedAt: { lt: staleBefore },
        },
        data: {
          status: PageSynchronizationStatus.PENDING,
          workerLock: null,
          errorMessage: null,
        },
      }),
    ]);
  }

  private async drain(): Promise<void> {
    if (this.workerActive) return;
    this.workerActive = true;
    try {
      while (true) {
        const jobId = await this.claimNextJob();
        if (jobId === null) return;
        await this.processJob(jobId);
      }
    } finally {
      this.workerActive = false;
    }
  }

  private async claimNextJob(): Promise<number | null> {
    const pending = await this.prisma.pageSynchronizationJob.findFirst({
      where: { status: PageSynchronizationStatus.PENDING },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!pending) return null;
    try {
      const claimed = await this.prisma.pageSynchronizationJob.updateMany({
        where: {
          id: pending.id,
          status: PageSynchronizationStatus.PENDING,
          workerLock: null,
        },
        data: {
          status: PageSynchronizationStatus.RUNNING,
          workerLock: 1,
          startedAt: new Date(),
          completedAt: null,
          errorMessage: null,
        },
      });
      return claimed.count === 1 ? pending.id : null;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        return null;
      throw error;
    }
  }

  private async processJob(jobId: number): Promise<void> {
    try {
      const job = await this.prisma.pageSynchronizationJob.findUniqueOrThrow({
        where: { id: jobId },
        select: {
          id: true,
          organizationTypeId: true,
          requestedById: true,
          items: {
            where: { status: PageSynchronizationItemStatus.PENDING },
            select: {
              id: true,
              organization: { select: { id: true, uuid: true } },
            },
            orderBy: { id: 'asc' },
          },
        },
      });
      const templates = await this.getTemplates(job.organizationTypeId!);
      for (const item of job.items)
        await this.processItem(
          job.id,
          item.id,
          item.organization,
          templates,
          job.requestedById,
        );
      await this.completeJob(job.id);
    } catch (error) {
      await this.failJob(jobId, error);
    }
  }

  private async getTemplates(
    organizationTypeId: number,
  ): Promise<PageTemplate[]> {
    const menus = await this.prisma.menu.findMany({
      where: {
        organizationTypeId,
        contentTypeId: { not: null },
        contentType: { isDeleted: false },
        isActive: true,
        isDeleted: false,
      },
      select: {
        contentTypeId: true,
        titleEnglish: true,
        titleHindi: true,
        display_order: true,
      },
      orderBy: [{ display_order: 'asc' }, { id: 'asc' }],
    });
    const templates = new Map<number, PageTemplate>();
    for (const menu of menus) {
      if (menu.contentTypeId === null || templates.has(menu.contentTypeId))
        continue;
      templates.set(menu.contentTypeId, {
        contentTypeId: menu.contentTypeId,
        titleEnglish: menu.titleEnglish,
        titleHindi: menu.titleHindi,
        displayOrder: menu.display_order,
      });
    }
    return [...templates.values()];
  }

  private async processItem(
    jobId: number,
    itemId: number,
    organization: { id: number; uuid: string },
    templates: PageTemplate[],
    requestedById: number,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (transaction) => {
        const claimed = await transaction.pageSynchronizationItem.updateMany({
          where: {
            id: itemId,
            status: PageSynchronizationItemStatus.PENDING,
          },
          data: {
            status: PageSynchronizationItemStatus.RUNNING,
            startedAt: new Date(),
            completedAt: null,
            errorMessage: null,
          },
        });
        if (claimed.count !== 1) return;

        const contentTypeIds = templates.map((item) => item.contentTypeId);
        const existing =
          contentTypeIds.length === 0
            ? []
            : await transaction.page.findMany({
                where: {
                  organizationId: organization.id,
                  contentTypeId: { in: contentTypeIds },
                },
                select: { contentTypeId: true },
              });
        const existingIds = new Set(existing.map((page) => page.contentTypeId));
        const missing = templates.filter(
          (template) => !existingIds.has(template.contentTypeId),
        );
        const created =
          missing.length === 0
            ? { count: 0 }
            : await transaction.page.createMany({
                data: missing.map((template) => ({
                  organizationId: organization.id,
                  contentTypeId: template.contentTypeId,
                  titleEnglish: template.titleEnglish,
                  titleHindi: template.titleHindi,
                  slug: `auto-${organization.uuid}-${template.contentTypeId}`,
                  contentEnglish: '<p></p>',
                  contentHindi: null,
                  status: PageStatus.DRAFT,
                  display_order: template.displayOrder,
                  createdById: requestedById,
                  updatedById: requestedById,
                })),
                skipDuplicates: true,
              });
        await transaction.pageSynchronizationItem.update({
          where: { id: itemId },
          data: {
            status: PageSynchronizationItemStatus.COMPLETED,
            createdPages: created.count,
            skippedPages: templates.length - created.count,
            completedAt: new Date(),
          },
        });
        await transaction.pageSynchronizationJob.update({
          where: { id: jobId },
          data: { updatedAt: new Date() },
        });
      });
    } catch (error) {
      await this.prisma.pageSynchronizationItem.update({
        where: { id: itemId },
        data: {
          status: PageSynchronizationItemStatus.FAILED,
          errorMessage: this.errorMessage(error),
          completedAt: new Date(),
        },
      });
    }
  }

  private async completeJob(jobId: number): Promise<void> {
    const items = await this.prisma.pageSynchronizationItem.findMany({
      where: { jobId },
      select: { status: true, createdPages: true, skippedPages: true },
    });
    const failedOrganizations = items.filter(
      (item) => item.status === PageSynchronizationItemStatus.FAILED,
    ).length;
    await this.prisma.pageSynchronizationJob.update({
      where: { id: jobId },
      data: {
        status:
          failedOrganizations > 0
            ? PageSynchronizationStatus.COMPLETED_WITH_ERRORS
            : PageSynchronizationStatus.COMPLETED,
        processedOrganizations: items.filter(
          (item) =>
            item.status === PageSynchronizationItemStatus.COMPLETED ||
            item.status === PageSynchronizationItemStatus.FAILED,
        ).length,
        createdPages: items.reduce(
          (total, item) => total + item.createdPages,
          0,
        ),
        skippedPages: items.reduce(
          (total, item) => total + item.skippedPages,
          0,
        ),
        failedOrganizations,
        workerLock: null,
        completedAt: new Date(),
      },
    });
  }

  private async failJob(jobId: number, error: unknown): Promise<void> {
    try {
      await this.prisma.pageSynchronizationJob.update({
        where: { id: jobId },
        data: {
          status: PageSynchronizationStatus.FAILED,
          workerLock: null,
          errorMessage: this.errorMessage(error),
          completedAt: new Date(),
        },
      });
    } catch (updateError) {
      this.logger.error(
        `Unable to record failure for page synchronization job ${jobId}.`,
        this.errorStack(updateError),
      );
    }
  }

  private isSupportedType(code: string): boolean {
    return (SUPPORTED_ORGANIZATION_TYPES as readonly string[]).includes(code);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error.';
  }

  private errorStack(error: unknown): string | undefined {
    return error instanceof Error ? error.stack : undefined;
  }

  private toJobResponse(job: {
    uuid: string;
    scope: PageSynchronizationScope;
    status: PageSynchronizationStatus;
    totalOrganizations: number;
    processedOrganizations: number;
    createdPages: number;
    skippedPages: number;
    failedOrganizations: number;
    errorMessage: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    organization: { uuid: string; organizationName: string } | null;
    organizationType: { uuid: string; code: string; name: string } | null;
  }) {
    return {
      uuid: job.uuid,
      scope: job.scope,
      status: job.status,
      organization: job.organization
        ? {
            uuid: job.organization.uuid,
            name: job.organization.organizationName,
          }
        : null,
      organization_type: job.organizationType,
      total_organizations: job.totalOrganizations,
      processed_organizations: job.processedOrganizations,
      created_pages: job.createdPages,
      skipped_pages: job.skippedPages,
      failed_organizations: job.failedOrganizations,
      error: job.errorMessage,
      started_at: job.startedAt,
      completed_at: job.completedAt,
      created_at: job.createdAt,
    };
  }
}
