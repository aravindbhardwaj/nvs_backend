import { NotFoundException } from '@nestjs/common';
import { BannersController } from '../banners/banners.controller';
import { GalleryController } from '../gallery/gallery.controller';
import { LeadershipController } from '../leadership/leadership.controller';
import { MediaController } from '../media/media.controller';
import { JnvPrincipalsController } from '../jnv-principals/jnv-principals.controller';

const uuid = '550e8400-e29b-41d4-a716-446655440000';
const file = { path: '/tmp/test-upload' };
const cases = [
  [
    BannersController,
    'replaceImageByUuid',
    [uuid, file, {}],
    'cleanupUploadedFile',
    file,
  ],
  [
    GalleryController,
    'replaceByUuid',
    [uuid, file, {}],
    'cleanupUploadedFiles',
    [file],
  ],
  [
    LeadershipController,
    'replaceImageByUuid',
    [uuid, file, {}],
    'cleanupUploadedFile',
    file,
  ],
  [
    MediaController,
    'replaceFileByUuid',
    [uuid, { file: [file] }, {}],
    'cleanupUploadedFiles',
    [file, undefined],
  ],
  [
    JnvPrincipalsController,
    'replaceImageByUuid',
    [10, uuid, file, {}],
    'cleanupUploadedFile',
    file,
  ],
] as const;

describe('UUID lookup failure after file upload', () => {
  it.each(cases)(
    '%p cleans up its upload',
    async (Controller, method, args, cleanup, expected) => {
      const missing = new NotFoundException('Record not found.');
      const service = {
        resolveUuid: jest.fn().mockRejectedValue(missing),
        [cleanup]: jest.fn().mockResolvedValue(undefined),
      };
      // Only the lookup and cleanup paths run; no actual files or database writes.
      const controller = new (Controller as new (service: unknown) => any)(
        service,
      );
      await expect(controller[method](...args)).rejects.toBe(missing);
      expect(service[cleanup]).toHaveBeenCalledWith(expected);
    },
  );
});
