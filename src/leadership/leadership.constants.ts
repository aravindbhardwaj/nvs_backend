import { getUploadConfiguration } from '../config/upload.config';

export const ALLOWED_LEADER_IMAGE_TYPES: Readonly<
  Record<string, readonly string[]>
> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
};

export const MAX_LEADER_IMAGE_SIZE =
  getUploadConfiguration().leadership.maxSize;
