import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';
import { ALLOWED_LEADER_IMAGE_TYPES } from './leadership.constants';

export const LEADERSHIP_UPLOADS_ROOT = join(
  process.cwd(),
  process.env.LEADERSHIP_UPLOAD_PATH ?? 'resources/leadership_uploads',
);

export function validateLeaderFile(file: Express.Multer.File): void {
  const extension = extname(file.originalname).slice(1).toLowerCase();
  const allowed = ALLOWED_LEADER_IMAGE_TYPES[extension];
  const base = file.originalname.slice(0, -(extension.length + 1));
  const doubleExtension = Object.keys(ALLOWED_LEADER_IMAGE_TYPES).some((item) =>
    base.toLowerCase().endsWith(`.${item}`),
  );
  if (
    !allowed ||
    doubleExtension ||
    !allowed.includes(file.mimetype) ||
    file.size <= 0
  ) {
    throw new BadRequestException(
      'The uploaded leader picture type is not allowed.',
    );
  }
}

export async function validateLeaderImage(
  file: Express.Multer.File,
): Promise<void> {
  validateLeaderFile(file);
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
  if (!jpeg && !png && !webp) {
    throw new BadRequestException(
      'The uploaded leader picture content is invalid.',
    );
  }
}

export const leadershipStorage = diskStorage({
  destination: (_request, _file, callback) => {
    const date = new Date();
    const destination = join(
      LEADERSHIP_UPLOADS_ROOT,
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
