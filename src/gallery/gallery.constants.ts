import 'dotenv/config';

export const ALLOWED_GALLERY_TYPES: Readonly<
  Record<string, readonly string[]>
> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
};

const configuredSize = Number(process.env.GALLERY_MAX_UPLOAD_SIZE);
const configuredCount = Number(process.env.GALLERY_MAX_UPLOAD_COUNT);

export const MAX_GALLERY_UPLOAD_SIZE =
  Number.isSafeInteger(configuredSize) && configuredSize > 0
    ? configuredSize
    : 5 * 1024 * 1024;
export const MAX_GALLERY_UPLOAD_COUNT =
  Number.isSafeInteger(configuredCount) && configuredCount > 0
    ? configuredCount
    : 10;
