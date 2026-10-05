import { getUploadConfiguration } from '../config/upload.config';

export const ALLOWED_JNV_PRINCIPAL_IMAGE_TYPES: Readonly<
  Record<string, readonly string[]>
> = {
  jpg: ['image/jpeg', 'image/jpg', 'application/octet-stream'],
  jpeg: ['image/jpeg', 'image/jpg', 'application/octet-stream'],
  png: ['image/png', 'image/x-png', 'application/octet-stream'],
  webp: ['image/webp'],
};

export const MAX_JNV_PRINCIPAL_IMAGE_SIZE =
  getUploadConfiguration().jnvPrincipal.maxSize;
