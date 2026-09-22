import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { OrganizationLeadershipService } from './organization-leadership.service';

@Public()
@Controller('api/public/organization-leadership')
export class PublicOrganizationLeadershipController {
  constructor(private readonly leadership: OrganizationLeadershipService) {}

  @Get(':organizationUuid/image')
  async image(
    @Param('organizationUuid', ParseUUIDPipe) organizationUuid: string,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.leadership.imageStream(organizationUuid, true);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }

  @Get('uuid/:leadershipUuid/image')
  async imageByUuid(
    @Param('leadershipUuid', ParseUUIDPipe) leadershipUuid: string,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.leadership.imageStreamByUuid(leadershipUuid, true);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }

  @Get(':organizationUuid')
  async findOne(
    @Param('organizationUuid', ParseUUIDPipe) organizationUuid: string,
  ) {
    return {
      message: 'Organization leader retrieved successfully.',
      data: await this.leadership.findPublic(organizationUuid),
    };
  }
}
