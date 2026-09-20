import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';
import {
  validateBannerFile,
  validateBannerImage,
} from '../banners/banner.storage';

export const HEADER_LOGO_UPLOADS_ROOT = join(
  process.cwd(),
  'resources/header_logo_uploads',
);
export const MAX_HEADER_LOGO_SIZE = 5 * 1024 * 1024;
export const validateHeaderLogoFile = validateBannerFile;
export const validateHeaderLogoImage = validateBannerImage;

export const headerLogoStorage = diskStorage({
  destination: (_request, _file, callback) => {
    try {
      mkdirSync(HEADER_LOGO_UPLOADS_ROOT, { recursive: true });
      callback(null, HEADER_LOGO_UPLOADS_ROOT);
    } catch {
      callback(new BadRequestException('Unable to prepare logo upload.'), '');
    }
  },
  filename: (_request, file, callback) =>
    callback(
      null,
      `${randomUUID()}${extname(file.originalname).toLowerCase()}`,
    ),
});
