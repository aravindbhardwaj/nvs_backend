import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MediaService } from './media.service';

export function subtractUtcMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() - months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(originalDay, lastDay));
  return result;
}

@Injectable()
export class MediaArchivalSchedulerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(MediaArchivalSchedulerService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly mediaService: MediaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    const systemUserId = this.config.get<number | null>(
      'mediaArchive.systemUserId',
      null,
    );
    if (!systemUserId) {
      this.logger.warn(
        'Automatic media archival is disabled because MEDIA_ARCHIVE_SYSTEM_USER_ID is not configured.',
      );
      return;
    }

    void this.run();
    const intervalMs = this.config.get<number>(
      'mediaArchive.jobIntervalMs',
      86_400_000,
    );
    this.timer = setInterval(() => void this.run(), intervalMs);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async run(now = new Date()): Promise<number> {
    if (this.running) return 0;
    const systemUserId = this.config.get<number | null>(
      'mediaArchive.systemUserId',
      null,
    );
    if (!systemUserId) return 0;

    this.running = true;
    try {
      const afterMonths = this.config.get<number>(
        'mediaArchive.afterMonths',
        3,
      );
      const batchSize = this.config.get<number>('mediaArchive.batchSize', 100);
      const cutoff = subtractUtcMonths(now, afterMonths);
      const count = await this.mediaService.archiveEligibleMedia(
        cutoff,
        systemUserId,
        batchSize,
      );
      if (count > 0)
        this.logger.log(`Automatically archived ${count} media record(s).`);
      return count;
    } catch (error) {
      this.logger.error(
        'Automatic media archival failed.',
        error instanceof Error ? error.stack : String(error),
      );
      return 0;
    } finally {
      this.running = false;
    }
  }
}
