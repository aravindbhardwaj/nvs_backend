import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { LeadershipService } from './leadership.service';

@Public()
@Controller('api/public/leadership')
export class PublicLeadershipController {
  constructor(private readonly leadership: LeadershipService) {}

  @Get()
  async findAll() {
    return {
      message: 'Leadership data retrieved successfully.',
      data: await this.leadership.findPublic(),
    };
  }

  @Get(':id/image')
  async image(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.leadership.imageStream(id, true);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Leader retrieved successfully.',
      data: await this.leadership.findPublicOne(id),
    };
  }
}
