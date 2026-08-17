import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { Public } from '../auth/decorators/public.decorator';
import { GetPublicMediaQueryDto } from './dto/get-public-media-query.dto';
import { MediaService } from './media.service';

@Public()
@Controller('api/public/media')
export class PublicMediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  async findAll(@Query() query: GetPublicMediaQueryDto) {
    return {
      message: 'Public media retrieved successfully.',
      data: await this.media.findPublic(query),
    };
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Query('organization_id') organizationId: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const document = await this.media.publicDownload(
      id,
      organizationId === undefined ? undefined : Number(organizationId),
    );
    response.setHeader('Content-Type', document.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(document.filename)}`,
    );
    document.stream.on('error', () => response.destroy());
    document.stream.pipe(response);
  }
}
