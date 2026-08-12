import { BadRequestException } from '@nestjs/common';

import { validateBannerFile } from './banner.storage';

describe('validateBannerFile', () => {
  const file = (originalname: string, mimetype: string, size = 10) =>
    ({ originalname, mimetype, size }) as Express.Multer.File;

  it.each([
    ['banner.jpg', 'image/jpeg'],
    ['banner.png', 'image/png'],
    ['banner.webp', 'image/webp'],
  ])('accepts supported %s images', (originalname, mimetype) => {
    expect(() =>
      validateBannerFile(file(originalname, mimetype)),
    ).not.toThrow();
  });

  it('rejects invalid types, mismatched MIME types, empty files, and double extensions', () => {
    expect(() => validateBannerFile(file('banner.gif', 'image/gif'))).toThrow(
      BadRequestException,
    );
    expect(() => validateBannerFile(file('banner.jpg', 'image/png'))).toThrow(
      BadRequestException,
    );
    expect(() =>
      validateBannerFile(file('banner.png', 'image/png', 0)),
    ).toThrow(BadRequestException);
    expect(() =>
      validateBannerFile(file('banner.jpg.exe', 'application/octet-stream')),
    ).toThrow(BadRequestException);
  });
});
