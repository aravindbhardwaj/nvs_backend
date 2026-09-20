import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';

const ALLOWED_IMAGE_TYPES: Record<string, string[]> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
};

export const CKEDITOR_IMAGE_UPLOADS_ROOT = join(
  process.cwd(),
  process.env.CKEDITOR_IMAGE_UPLOAD_PATH ?? 'resources/ckeditor_image_uploads',
);

export const MAX_CKEDITOR_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateCkeditorImageFile(file: Express.Multer.File): void {
  const extension = extname(file.originalname).slice(1).toLowerCase();
  const allowedMimeTypes = ALLOWED_IMAGE_TYPES[extension];
  const filenameWithoutExtension = file.originalname.slice(
    0,
    -(extension.length + 1),
  );
  const hasDoubleImageExtension = Object.keys(ALLOWED_IMAGE_TYPES).some(
    (allowedExtension) =>
      filenameWithoutExtension.toLowerCase().endsWith(`.${allowedExtension}`),
  );

  if (
    !allowedMimeTypes ||
    hasDoubleImageExtension ||
    !allowedMimeTypes.includes(file.mimetype)
  ) {
    throw new BadRequestException(
      'Only JPEG, PNG, and WebP images are allowed.',
    );
  }
}

export async function validateCkeditorImageContent(
  file: Express.Multer.File,
): Promise<void> {
  validateCkeditorImageFile(file);

  if (file.size <= 0) {
    throw new BadRequestException('The uploaded image is empty.');
  }

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
  const extension = extname(file.originalname).slice(1).toLowerCase();
  const contentMatchesExtension =
    ((extension === 'jpg' || extension === 'jpeg') && isJpeg) ||
    (extension === 'png' && isPng) ||
    (extension === 'webp' && isWebp);

  if (!contentMatchesExtension) {
    throw new BadRequestException('The uploaded image content is invalid.');
  }
}

export const ckeditorImageStorage = diskStorage({
  destination: (_request, _file, callback) => {
    try {
      mkdirSync(CKEDITOR_IMAGE_UPLOADS_ROOT, { recursive: true });
      callback(null, CKEDITOR_IMAGE_UPLOADS_ROOT);
    } catch {
      callback(new BadRequestException('Unable to prepare image upload.'), '');
    }
  },
  filename: (_request, file, callback) =>
    callback(
      null,
      `${randomUUID()}${extname(file.originalname).toLowerCase()}`,
    ),
});
