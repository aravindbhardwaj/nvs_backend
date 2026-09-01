import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';
import { ALLOWED_JNV_PRINCIPAL_IMAGE_TYPES } from './jnv-principals.constants';

export const JNV_PRINCIPAL_UPLOADS_ROOT = join(
  process.cwd(),
  process.env.JNV_PRINCIPAL_UPLOAD_PATH ?? 'resources/jnv_principal_uploads',
);

export function validateJnvPrincipalFile(file: Express.Multer.File): void {
  const extension = extname(file.originalname).slice(1).toLowerCase();
  const allowed = ALLOWED_JNV_PRINCIPAL_IMAGE_TYPES[extension];
  const base = file.originalname.slice(0, -(extension.length + 1));
  const doubleExtension = Object.keys(ALLOWED_JNV_PRINCIPAL_IMAGE_TYPES).some(
    (item) => base.toLowerCase().endsWith(`.${item}`),
  );
  if (
    !allowed ||
    doubleExtension ||
    !allowed.includes(file.mimetype) ||
    file.size <= 0
  ) {
    throw new BadRequestException(
      'The uploaded principal picture type is not allowed.',
    );
  }
}

export async function validateJnvPrincipalImage(
  file: Express.Multer.File,
): Promise<void> {
  validateJnvPrincipalFile(file);
  const extension = extname(file.originalname).slice(1).toLowerCase();
  const header = (await readFile(file.path)).subarray(0, 12);
  const jpeg =
    header.length >= 3 &&
    header[0] === 0xff &&
    header[1] === 0xd8 &&
    header[2] === 0xff;
  const png =
    header.length >= 8 &&
    header
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp =
    header.length >= 12 &&
    header.subarray(0, 4).toString('ascii') === 'RIFF' &&
    header.subarray(8, 12).toString('ascii') === 'WEBP';
  const detectedType = jpeg
    ? 'image/jpeg'
    : png
      ? 'image/png'
      : webp
        ? 'image/webp'
        : null;
  const extensionMatches =
    (detectedType === 'image/jpeg' &&
      (extension === 'jpg' || extension === 'jpeg')) ||
    (detectedType === 'image/png' && extension === 'png') ||
    (detectedType === 'image/webp' && extension === 'webp');
  if (!detectedType || !extensionMatches) {
    throw new BadRequestException(
      'The uploaded principal picture content is invalid.',
    );
  }
  file.mimetype = detectedType;
}

export const jnvPrincipalStorage = diskStorage({
  destination: (_request, _file, callback) => {
    const date = new Date();
    const destination = join(
      JNV_PRINCIPAL_UPLOADS_ROOT,
      String(date.getUTCFullYear()),
      String(date.getUTCMonth() + 1).padStart(2, '0'),
    );
    mkdirSync(destination, { recursive: true });
    callback(null, destination);
  },
  filename: (_request, file, callback) =>
    callback(
      null,
      `${randomUUID()}${extname(file.originalname).toLowerCase()}`,
    ),
});
