import { getUploadConfiguration } from '../config/upload.config';

export const ALLOWED_GALLERY_TYPES: Readonly<
  Record<string, readonly string[]>
> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
};

export const MAX_GALLERY_UPLOAD_SIZE = getUploadConfiguration().gallery.maxSize;
export const MAX_GALLERY_UPLOAD_COUNT =
  getUploadConfiguration().gallery.maxCount;
