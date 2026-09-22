import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetGalleryImagesQueryDto } from './get-gallery-images-query.dto';

describe('GetGalleryImagesQueryDto', () => {
  it('accepts organizationUuid without exposing internal gallery fields', async () => {
    const dto = plainToInstance(GetGalleryImagesQueryDto, {
      page: '1',
      limit: '20',
      organizationUuid: '2e1d4979-0cfa-469c-95bb-466065c0f6c5',
    });

    expect(
      await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    ).toHaveLength(0);
  });
});
