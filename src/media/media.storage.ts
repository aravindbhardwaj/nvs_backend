import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';

import { ALLOWED_MEDIA_TYPES } from './media.constants';

export const UPLOADS_ROOT = join(process.cwd(), 'resources', 'media_uploads');

export function validateMediaFile(file: Express.Multer.File): void {
  const extension = extname(file.originalname).slice(1).toLowerCase();
  const allowedMimeTypes = ALLOWED_MEDIA_TYPES[extension];
  const filenameWithoutExtension = file.originalname.slice(
    0,
    -(extension.length + 1),
  );
  const hasDoubleExtension = Object.keys(ALLOWED_MEDIA_TYPES).some(
    (allowedExtension) =>
      filenameWithoutExtension.toLowerCase().endsWith(`.${allowedExtension}`),
  );

  if (
    !allowedMimeTypes ||
    hasDoubleExtension ||
    !allowedMimeTypes.includes(file.mimetype)
  ) {
    throw new BadRequestException('The uploaded file type is not allowed.');
  }
}

export const mediaStorage = diskStorage({
  destination: (_request, _file, callback) => {
    const date = new Date();
    const destination = join(
      UPLOADS_ROOT,
      String(date.getUTCFullYear()),
      String(date.getUTCMonth() + 1).padStart(2, '0'),
    );
    mkdirSync(destination, { recursive: true });
    callback(null, destination);
  },
  filename: (_request, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  },
});
