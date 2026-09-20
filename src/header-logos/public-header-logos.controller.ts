import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { HeaderLogosService } from './header-logos.service';

@Public()
@Controller('api/public/header-logos')
export class PublicHeaderLogosController {
  constructor(private readonly service: HeaderLogosService) {}

  @Get()
  async find(@Query('for_jnv') forJnv?: string) {
    return {
      message: 'Header logos retrieved successfully.',
      data: await this.service.findPublic(forJnv === 'true'),
    };
  }

  @Get('uuid/:uuid/image')
  async imageByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Res() response: Response,
  ) {
    return this.image(await this.service.resolveUuid(uuid), response);
  }

  @Get(':id/image')
  async image(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ) {
    const image = await this.service.imageStream(id, true);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.pipe(response);
  }
}
