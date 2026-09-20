import { BadRequestException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CkeditorImagesController } from './ckeditor-images.controller';
import { validateCkeditorImageContent } from './ckeditor-image.storage';

describe('CkeditorImagesController', () => {
  let temporaryDirectory: string;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'ckeditor-image-test-'));
  });

  afterEach(async () => {
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  function uploadedFile(path: string): Express.Multer.File {
    return {
      fieldname: 'image',
      originalname: 'example.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 8,
      destination: temporaryDirectory,
      filename: '123e4567-e89b-12d3-a456-426614174000.png',
      path,
      buffer: Buffer.alloc(0),
      stream: null as never,
    };
  }

  it('returns the exact CKEditor URL response shape', async () => {
    const path = join(temporaryDirectory, 'image.png');
    await writeFile(
      path,
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    const request = {
      protocol: 'https',
      get: jest.fn().mockReturnValue('api.example.test'),
    } as unknown as Request;
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await new CkeditorImagesController().upload(
      uploadedFile(path),
      request,
      response,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      url: 'https://api.example.test/api/ckeditor-images/123e4567-e89b-12d3-a456-426614174000.png',
    });
  });

  it('rejects a file whose content does not match its image extension', async () => {
    const path = join(temporaryDirectory, 'fake.png');
    await writeFile(path, 'not an image');

    await expect(
      validateCkeditorImageContent(uploadedFile(path)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
