import { getUploadConfiguration } from '../config/upload.config';

export const ALLOWED_BANNER_TYPES: Readonly<Record<string, readonly string[]>> =
  {
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
    png: ['image/png'],
    webp: ['image/webp'],
  };

export const MAX_BANNER_UPLOAD_SIZE = getUploadConfiguration().banner.maxSize;
