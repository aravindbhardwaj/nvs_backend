import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';

import { ALLOWED_BANNER_TYPES } from './banner.constants';

export const BANNER_UPLOADS_ROOT = join(
  process.cwd(),
  process.env.BANNER_UPLOAD_PATH ?? 'resources/banner_uploads',
);

export function validateBannerFile(file: Express.Multer.File): void {
  const extension = extname(file.originalname).slice(1).toLowerCase();
  const allowedMimeTypes = ALLOWED_BANNER_TYPES[extension];
  const filenameWithoutExtension = file.originalname.slice(
    0,
    -(extension.length + 1),
  );
  const hasDoubleExtension = Object.keys(ALLOWED_BANNER_TYPES).some(
    (allowedExtension) =>
      filenameWithoutExtension.toLowerCase().endsWith(`.${allowedExtension}`),
  );

  if (
    !allowedMimeTypes ||
    hasDoubleExtension ||
    !allowedMimeTypes.includes(file.mimetype) ||
    file.size <= 0
  ) {
    throw new BadRequestException(
      'The uploaded banner image type is not allowed.',
    );
  }
}

export async function validateBannerImage(
  file: Express.Multer.File,
): Promise<void> {
  validateBannerFile(file);
  const header = await readFile(file.path).then((contents) =>
    contents.subarray(0, 12),
  );
  const isJpeg =
    header.length >= 3 &&
    header[0] === 0xff &&
    header[1] === 0xd8 &&
    header[2] === 0xff;
  const isPng =
    header.length >= 8 &&
    header
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp =
    header.length >= 12 &&
    header.subarray(0, 4).toString('ascii') === 'RIFF' &&
    header.subarray(8, 12).toString('ascii') === 'WEBP';

  if (!isJpeg && !isPng && !isWebp) {
    throw new BadRequestException(
      'The uploaded banner image content is invalid.',
    );
  }
}

export const bannerStorage = diskStorage({
  destination: (_request, _file, callback) => {
    const date = new Date();
    const destination = join(
      BANNER_UPLOADS_ROOT,
      String(date.getUTCFullYear()),
      String(date.getUTCMonth() + 1).padStart(2, '0'),
    );
    mkdirSync(destination, { recursive: true });
    callback(null, destination);
  },
  filename: (_request, file, callback) => {
    callback(
      null,
      `${randomUUID()}${extname(file.originalname).toLowerCase()}`,
    );
  },
});
