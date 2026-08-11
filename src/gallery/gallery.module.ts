import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GalleryController } from './gallery.controller';
import { PublicGalleryController } from './public-gallery.controller';
import { GalleryService } from './gallery.service';

@Module({
  imports: [AuthModule],
  controllers: [GalleryController, PublicGalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
