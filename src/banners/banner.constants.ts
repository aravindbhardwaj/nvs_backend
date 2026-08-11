import 'dotenv/config';

export const ALLOWED_BANNER_TYPES: Readonly<Record<string, readonly string[]>> =
  {
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
    png: ['image/png'],
    webp: ['image/webp'],
  };

const configuredUploadSize = Number(process.env.BANNER_MAX_UPLOAD_SIZE);

export const MAX_BANNER_UPLOAD_SIZE =
  Number.isSafeInteger(configuredUploadSize) && configuredUploadSize > 0
    ? configuredUploadSize
    : 5 * 1024 * 1024;
