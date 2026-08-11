import { BadRequestException } from '@nestjs/common';
import { validateGalleryFile } from './gallery.storage';

describe('validateGalleryFile', () => {
  const file = (originalname: string, mimetype: string, size = 10) =>
    ({ originalname, mimetype, size }) as Express.Multer.File;
  it.each([
    ['gallery.jpg', 'image/jpeg'],
    ['gallery.png', 'image/png'],
    ['gallery.webp', 'image/webp'],
  ])('accepts supported %s images', (originalname, mimetype) =>
    expect(() =>
      validateGalleryFile(file(originalname, mimetype)),
    ).not.toThrow(),
  );
  it('rejects invalid types, mismatched MIME types, empty files, and double extensions', () => {
    expect(() => validateGalleryFile(file('gallery.gif', 'image/gif'))).toThrow(
      BadRequestException,
    );
    expect(() => validateGalleryFile(file('gallery.jpg', 'image/png'))).toThrow(
      BadRequestException,
    );
    expect(() =>
      validateGalleryFile(file('gallery.png', 'image/png', 0)),
    ).toThrow(BadRequestException);
    expect(() =>
      validateGalleryFile(file('gallery.jpg.exe', 'application/octet-stream')),
    ).toThrow(BadRequestException);
  });
});
