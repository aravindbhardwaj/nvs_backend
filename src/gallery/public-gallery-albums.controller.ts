import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { GetGalleriesQueryDto } from './dto/get-galleries-query.dto';
import { GalleryAlbumsService } from './gallery-albums.service';

@Public()
@Controller('api/public/galleries')
export class PublicGalleryAlbumsController {
  constructor(private readonly galleries: GalleryAlbumsService) {}

  @Get() async findAll(@Query() query: GetGalleriesQueryDto) {
    return {
      message: 'Public galleries retrieved successfully.',
      data: await this.galleries.findPublic(query),
    };
  }
}
