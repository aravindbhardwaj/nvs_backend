import 'dotenv/config';

export const ALLOWED_JNV_PRINCIPAL_IMAGE_TYPES: Readonly<
  Record<string, readonly string[]>
> = {
  jpg: ['image/jpeg', 'image/jpg', 'application/octet-stream'],
  jpeg: ['image/jpeg', 'image/jpg', 'application/octet-stream'],
  png: ['image/png', 'image/x-png', 'application/octet-stream'],
  webp: ['image/webp'],
};

const configuredSize = Number(process.env.JNV_PRINCIPAL_MAX_UPLOAD_SIZE);
export const MAX_JNV_PRINCIPAL_IMAGE_SIZE =
  Number.isSafeInteger(configuredSize) && configuredSize > 0
    ? configuredSize
    : 5 * 1024 * 1024;
