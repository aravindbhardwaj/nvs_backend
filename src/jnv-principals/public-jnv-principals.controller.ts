import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { JnvPrincipalsService } from './jnv-principals.service';

@Public()
@Controller('api/public/jnvs/:organizationId/principals')
export class PublicJnvPrincipalsController {
  constructor(private readonly principals: JnvPrincipalsService) {}

  @Get('current')
  async current(@Param('organizationId', ParseIntPipe) organizationId: number) {
    return {
      message: 'Current JNV principal retrieved successfully.',
      data: await this.principals.findPublicCurrent(organizationId),
    };
  }

  @Get('history')
  async history(@Param('organizationId', ParseIntPipe) organizationId: number) {
    return {
      message: 'JNV principal history retrieved successfully.',
      data: await this.principals.findPublicHistory(organizationId),
    };
  }

  @Get(':id/image')
  async image(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.principals.imageStream(organizationId, id, true);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }
}
