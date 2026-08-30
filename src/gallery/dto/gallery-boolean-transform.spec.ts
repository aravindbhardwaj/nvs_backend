import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateGalleryImageDto } from './create-gallery-image.dto';
import { UpdateGalleryImageDto } from './update-gallery-image.dto';

describe('Gallery boolean transforms', () => {
  it.each([CreateGalleryImageDto, UpdateGalleryImageDto])(
    'preserves multipart false values for %p',
    async (Dto) => {
      const dto = plainToInstance(
        Dto,
        { isActive: 'false', visible_to_all: 'false' },
        { enableImplicitConversion: true },
      );

      expect(dto.isActive).toBe(false);
      expect(dto.visible_to_all).toBe(false);
      expect(await validate(dto, { skipMissingProperties: true })).toHaveLength(
        0,
      );
    },
  );

  it('rejects invalid multipart boolean values', async () => {
    const dto = plainToInstance(
      UpdateGalleryImageDto,
      { isActive: 'not-a-boolean', visible_to_all: 'not-a-boolean' },
      { enableImplicitConversion: true },
    );

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['isActive', 'visible_to_all']),
    );
  });
});
