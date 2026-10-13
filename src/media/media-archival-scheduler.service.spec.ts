import { ConfigService } from '@nestjs/config';

import {
  MediaArchivalSchedulerService,
  subtractUtcMonths,
} from './media-archival-scheduler.service';
import { MediaService } from './media.service';

describe('MediaArchivalSchedulerService', () => {
  const mediaService = {
    archiveEligibleMedia: jest.fn(),
  };
  const values: Record<string, number | null> = {
    'mediaArchive.systemUserId': 99,
    'mediaArchive.afterMonths': 3,
    'mediaArchive.batchSize': 25,
    'mediaArchive.jobIntervalMs': 86_400_000,
  };
  const config = {
    get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
  };
  let service: MediaArchivalSchedulerService;

  beforeEach(() => {
    jest.clearAllMocks();
    values['mediaArchive.systemUserId'] = 99;
    mediaService.archiveEligibleMedia.mockResolvedValue(2);
    service = new MediaArchivalSchedulerService(
      mediaService as unknown as MediaService,
      config as unknown as ConfigService,
    );
  });

  afterEach(() => service.onModuleDestroy());

  it('calculates calendar-month cutoffs without overflowing month ends', () => {
    expect(subtractUtcMonths(new Date('2026-05-31T12:00:00.000Z'), 3)).toEqual(
      new Date('2026-02-28T12:00:00.000Z'),
    );
  });

  it('archives eligible records with configured values', async () => {
    const now = new Date('2026-10-13T08:00:00.000Z');

    await expect(service.run(now)).resolves.toBe(2);

    expect(mediaService.archiveEligibleMedia).toHaveBeenCalledWith(
      new Date('2026-07-13T08:00:00.000Z'),
      99,
      25,
    );
  });

  it('does not run automatic archival without a system user', async () => {
    values['mediaArchive.systemUserId'] = null;

    await expect(service.run()).resolves.toBe(0);

    expect(mediaService.archiveEligibleMedia).not.toHaveBeenCalled();
  });

  it('prevents overlapping scheduler executions', async () => {
    let finish!: () => void;
    mediaService.archiveEligibleMedia.mockImplementation(
      () => new Promise<number>((resolve) => (finish = () => resolve(1))),
    );

    const first = service.run();
    await expect(service.run()).resolves.toBe(0);
    finish();

    await expect(first).resolves.toBe(1);
    expect(mediaService.archiveEligibleMedia).toHaveBeenCalledTimes(1);
  });
});
