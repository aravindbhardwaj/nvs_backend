import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Public } from '../auth/decorators/public.decorator';
import {
  CKEDITOR_IMAGE_UPLOADS_ROOT,
  ckeditorImageStorage,
  MAX_CKEDITOR_IMAGE_SIZE,
  validateCkeditorImageContent,
  validateCkeditorImageFile,
} from './ckeditor-image.storage';

const uploadOptions = {
  storage: ckeditorImageStorage,
  limits: { fileSize: MAX_CKEDITOR_IMAGE_SIZE, files: 1 },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, accept: boolean) => void,
  ) => {
    try {
      validateCkeditorImageFile(file);
      callback(null, true);
    } catch (error) {
      callback(error as Error, false);
    }
  },
};

@Controller('api/ckeditor-images')
export class CkeditorImagesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    if (!file) throw new BadRequestException('An image file is required.');

    try {
      await validateCkeditorImageContent(file);
    } catch (error) {
      await unlink(file.path).catch(() => undefined);
      throw error;
    }

    const configuredBaseUrl = process.env.CKEDITOR_IMAGE_BASE_URL?.replace(
      /\/$/,
      '',
    );
    const baseUrl =
      configuredBaseUrl ?? `${request.protocol}://${request.get('host')}`;
    const url = `${baseUrl}/api/ckeditor-images/${file.filename}`;

    response.status(201).json({ url });
  }

  @Public()
  @Get(':filename')
  image(@Param('filename') filename: string, @Res() response: Response): void {
    if (!/^[0-9a-f-]{36}\.(?:jpe?g|png|webp)$/i.test(filename)) {
      throw new NotFoundException('Image not found.');
    }

    const path = join(CKEDITOR_IMAGE_UPLOADS_ROOT, filename);
    if (!existsSync(path)) throw new NotFoundException('Image not found.');

    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    response.type(contentTypes[extname(filename).toLowerCase()]);
    response.sendFile(path);
  }
}
