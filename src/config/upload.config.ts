import 'dotenv/config';

import { registerAs } from '@nestjs/config';

function positiveIntegerOrDefault(
  value: string | undefined,
  defaultValue: number,
): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : defaultValue;
}

export function getUploadConfiguration() {
  return {
    media: {
      maxSize: positiveIntegerOrDefault(
        process.env.MAX_UPLOAD_SIZE,
        10 * 1024 * 1024,
      ),
    },
    banner: {
      path: process.env.BANNER_UPLOAD_PATH ?? 'resources/banner_uploads',
      maxSize: positiveIntegerOrDefault(
        process.env.BANNER_MAX_UPLOAD_SIZE,
        5 * 1024 * 1024,
      ),
    },
    gallery: {
      path: process.env.GALLERY_UPLOAD_PATH ?? 'resources/gallery_uploads',
      maxSize: positiveIntegerOrDefault(
        process.env.GALLERY_MAX_UPLOAD_SIZE,
        5 * 1024 * 1024,
      ),
      maxCount: positiveIntegerOrDefault(
        process.env.GALLERY_MAX_UPLOAD_COUNT,
        10,
      ),
    },
    ckeditorImage: {
      path:
        process.env.CKEDITOR_IMAGE_UPLOAD_PATH ??
        'resources/ckeditor_image_uploads',
      baseUrl: process.env.CKEDITOR_IMAGE_BASE_URL?.replace(/\/$/, ''),
    },
    organizationProfileImage: {
      path:
        process.env.ORGANIZATION_PROFILE_IMAGE_UPLOAD_PATH ??
        'resources/organization_profile_images',
      baseUrl: process.env.ORGANIZATION_PROFILE_IMAGE_BASE_URL?.replace(
        /\/$/,
        '',
      ),
    },
    leadership: {
      path:
        process.env.LEADERSHIP_UPLOAD_PATH ?? 'resources/leadership_uploads',
      maxSize: positiveIntegerOrDefault(
        process.env.LEADERSHIP_MAX_UPLOAD_SIZE,
        5 * 1024 * 1024,
      ),
    },
    jnvPrincipal: {
      path:
        process.env.JNV_PRINCIPAL_UPLOAD_PATH ??
        'resources/jnv_principal_uploads',
      maxSize: positiveIntegerOrDefault(
        process.env.JNV_PRINCIPAL_MAX_UPLOAD_SIZE,
        5 * 1024 * 1024,
      ),
    },
    organizationLeadership: {
      path:
        process.env.ORGANIZATION_LEADERSHIP_UPLOAD_PATH ??
        'resources/organization_leadership_uploads',
      maxSize: positiveIntegerOrDefault(
        process.env.ORGANIZATION_LEADERSHIP_MAX_UPLOAD_SIZE,
        5 * 1024 * 1024,
      ),
    },
  };
}

export default registerAs('upload', getUploadConfiguration);
