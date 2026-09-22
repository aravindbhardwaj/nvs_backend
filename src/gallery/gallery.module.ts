import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GalleryController } from './gallery.controller';
import { PublicGalleryController } from './public-gallery.controller';
import { GalleryService } from './gallery.service';
import { GalleryAlbumsController } from './gallery-albums.controller';
import { PublicGalleryAlbumsController } from './public-gallery-albums.controller';
import { GalleryAlbumsService } from './gallery-albums.service';

@Module({
  imports: [AuthModule],
  controllers: [
    GalleryController,
    PublicGalleryController,
    GalleryAlbumsController,
    PublicGalleryAlbumsController,
  ],
  providers: [GalleryService, GalleryAlbumsService],
})
export class GalleryModule {}
