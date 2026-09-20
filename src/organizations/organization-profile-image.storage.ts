import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { readFile, unlink } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { diskStorage } from 'multer';

const ALLOWED_IMAGE_TYPES: Record<string, string[]> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
};

export const ORGANIZATION_PROFILE_IMAGE_ROOT = join(
  process.cwd(),
  process.env.ORGANIZATION_PROFILE_IMAGE_UPLOAD_PATH ??
    'resources/organization_profile_images',
);
export const MAX_ORGANIZATION_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateOrganizationProfileImageFile(
  file: Express.Multer.File,
): void {
  const extension = extname(file.originalname).slice(1).toLowerCase();
  if (!ALLOWED_IMAGE_TYPES[extension]?.includes(file.mimetype))
    throw new BadRequestException(
      'Only JPEG, PNG, and WebP organization images are allowed.',
    );
}

export async function validateOrganizationProfileImageContent(
  file: Express.Multer.File,
): Promise<void> {
  validateOrganizationProfileImageFile(file);
  if (file.size <= 0) throw new BadRequestException('The image is empty.');
  const header = await readFile(file.path).then((contents) =>
    contents.subarray(0, 12),
  );
  const extension = extname(file.originalname).slice(1).toLowerCase();
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
  const matches =
    ((extension === 'jpg' || extension === 'jpeg') && isJpeg) ||
    (extension === 'png' && isPng) ||
    (extension === 'webp' && isWebp);
  if (!matches)
    throw new BadRequestException('The organization image content is invalid.');
}

export async function cleanupOrganizationProfileImage(
  file?: Express.Multer.File,
): Promise<void> {
  if (file?.path) await unlink(file.path).catch(() => undefined);
}

export async function cleanupOrganizationProfileImageUrl(
  imageUrl?: string | null,
): Promise<void> {
  if (!imageUrl) return;
  const filename = basename(imageUrl);
  if (!/^[0-9a-f-]{36}\.(?:jpe?g|png|webp)$/i.test(filename)) return;
  await unlink(join(ORGANIZATION_PROFILE_IMAGE_ROOT, filename)).catch(
    () => undefined,
  );
}

export const organizationProfileImageStorage = diskStorage({
  destination: (_request, _file, callback) => {
    try {
      mkdirSync(ORGANIZATION_PROFILE_IMAGE_ROOT, { recursive: true });
      callback(null, ORGANIZATION_PROFILE_IMAGE_ROOT);
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
