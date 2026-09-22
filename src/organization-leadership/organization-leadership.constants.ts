import 'dotenv/config';

export const ALLOWED_ORGANIZATION_LEADER_IMAGE_TYPES: Readonly<
  Record<string, readonly string[]>
> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
};

const configuredSize = Number(
  process.env.ORGANIZATION_LEADERSHIP_MAX_UPLOAD_SIZE,
);
export const MAX_ORGANIZATION_LEADER_IMAGE_SIZE =
  Number.isSafeInteger(configuredSize) && configuredSize > 0
    ? configuredSize
    : 5 * 1024 * 1024;
