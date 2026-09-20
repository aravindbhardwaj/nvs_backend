import { Module } from '@nestjs/common';
import { CkeditorImagesController } from './ckeditor-images.controller';

@Module({ controllers: [CkeditorImagesController] })
export class CkeditorImagesModule {}
