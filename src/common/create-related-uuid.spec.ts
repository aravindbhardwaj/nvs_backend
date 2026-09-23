import 'reflect-metadata';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBannerDto } from '../banners/dto/create-banner.dto';
import { CreateGalleryImageDto } from '../gallery/dto/create-gallery-image.dto';
import { CreateMenuDto } from '../menus/dto/create-menu.dto';
import { UploadMediaDto } from '../media/dto/upload-media.dto';
import { CreateOrganizationDto } from '../organizations/dto/create-organization.dto';
import { CreatePageDto } from '../pages/dto/create-page.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { resolveRelatedId } from './utils/resolve-related-id.util';

const uuid = '550e8400-e29b-41d4-a716-446655440000';
const secondUuid = '6ba7b810-9dad-41d1-80b4-00c04fd430c8';

describe('create DTO related UUID support', () => {
  it.each([
    [
      CreatePageDto,
      {
        organizationUuid: uuid,
        contentTypeUuid: secondUuid,
        titleEnglish: 'Page',
        titleHindi: 'Page',
        contentEnglish: 'Content',
        contentHindi: 'Content',
      },
    ],
    [
      UploadMediaDto,
      {
        organizationUuid: uuid,
        mediaTypeUuid: secondUuid,
        titleEnglish: 'Media',
        titleHindi: 'Media',
      },
    ],
    [
      CreateOrganizationDto,
      {
        organizationName: 'Organization',
        organizationCode: 'ORG',
        organizationTypeUuid: uuid,
      },
    ],
    [
      CreateUserDto,
      {
        name: 'User',
        email: 'user@example.com',
        password: Buffer.alloc(256).toString('base64'),
        organizationUuid: uuid,
        organization_type_uuid: secondUuid,
      },
    ],
    [
      CreateMenuDto,
      {
        organization_type_uuid: uuid,
        menu_location: 1,
        title_english: 'Menu',
      },
    ],
    [
      CreateBannerDto,
      { organizationUuid: uuid, titleEnglish: 'Banner', titleHindi: 'Banner' },
    ],
    [
      CreateGalleryImageDto,
      { organizationUuid: uuid, titleEnglish: 'Image', titleHindi: 'Image' },
    ],
  ])('%p accepts UUID-only relation inputs', async (Dto, input) => {
    const errors = await validate(plainToInstance(Dto, input));
    expect(errors).toHaveLength(0);
  });
});

describe('resolveRelatedId', () => {
  it('resolves a UUID and preserves a matching numeric ID', async () => {
    const findByUuid = jest.fn().mockResolvedValue({ id: 17 });
    await expect(
      resolveRelatedId(17, uuid, 'Organization', findByUuid),
    ).resolves.toBe(17);
  });

  it('rejects unknown and conflicting UUID relationships', async () => {
    await expect(
      resolveRelatedId(undefined, uuid, 'Organization', async () => null),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      resolveRelatedId(18, uuid, 'Organization', async () => ({ id: 17 })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
