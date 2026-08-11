import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { GetGalleryImagesQueryDto } from './dto/get-gallery-images-query.dto';
import { GalleryService } from './gallery.service';

@Controller('api/public/gallery')
export class PublicGalleryController {
  constructor(private readonly gallery: GalleryService) {}
  @Get() async findAll(@Query() query: GetGalleryImagesQueryDto) {
    return {
      message: 'Public gallery images retrieved successfully.',
      data: await this.gallery.findPublic(query),
    };
  }
  @Get(':id/image') async image(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.gallery.imageStream(id);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }
}
