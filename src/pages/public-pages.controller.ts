import { Controller, Get, Param, Query } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { GetPublicPagesQueryDto } from './dto/get-public-pages-query.dto';
import { PagesService } from './pages.service';

@Public()
@Controller('api/public/pages')
export class PublicPagesController {
  constructor(private readonly pages: PagesService) {}

  @Get()
  async findAll(@Query() query: GetPublicPagesQueryDto) {
    return {
      message: 'Public pages retrieved successfully.',
      data: await this.pages.findPublic(query),
    };
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return {
      message: 'Public page retrieved successfully.',
      data: await this.pages.findPublicBySlug(slug),
    };
  }
}
