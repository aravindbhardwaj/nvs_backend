import { registerAs } from '@nestjs/config';

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export default registerAs('mediaArchive', () => ({
  afterMonths: positiveInteger(process.env.MEDIA_ARCHIVE_AFTER_MONTHS, 3),
  batchSize: positiveInteger(process.env.MEDIA_ARCHIVE_BATCH_SIZE, 100),
  jobIntervalMs: positiveInteger(
    process.env.MEDIA_ARCHIVE_JOB_INTERVAL_MS,
    86_400_000,
  ),
  systemUserId: process.env.MEDIA_ARCHIVE_SYSTEM_USER_ID
    ? Number(process.env.MEDIA_ARCHIVE_SYSTEM_USER_ID)
    : null,
}));
