import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { BannersService } from './banners.service';
import { GetPublicBannersQueryDto } from './dto/get-public-banners-query.dto';

@Controller('api/public/banners')
export class PublicBannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async findDisplayable(@Query() query: GetPublicBannersQueryDto) {
    return { message: 'Displayable banners retrieved successfully.', data: await this.bannersService.findDisplayable(query) };
  }

  @Get(':id/image')
  async image(@Param('id', ParseIntPipe) id: number, @Res() response: Response): Promise<void> {
    const image = await this.bannersService.publicImageStream(id);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }
}
