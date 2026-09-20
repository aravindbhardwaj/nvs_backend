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
import { GetPublicMediaQueryDto } from './dto/get-public-media-query.dto';
import { MediaService } from './media.service';

@Public()
@Controller('api/public/media')
export class PublicMediaController {
  constructor(private readonly media: MediaService) {}

  @Get('uuid/:uuid/download')
  async downloadByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query('organization_id') organizationId: string | undefined,
    @Query('organization_uuid') organizationUuid: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const id = await this.media.resolveUuid(uuid);
    return this.download(id, organizationUuid ?? organizationId, response);
  }

  @Get('uuid/:uuid/download/hindi')
  async downloadHindiByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query('organization_id') organizationId: string | undefined,
    @Query('organization_uuid') organizationUuid: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const id = await this.media.resolveUuid(uuid);
    return this.downloadHindi(id, organizationUuid ?? organizationId, response);
  }

  @Get()
  async findAll(@Query() query: GetPublicMediaQueryDto) {
    return {
      message: 'Public media retrieved successfully.',
      data: await this.media.findPublic(query),
    };
  }

  @Get('important-link-1')
  async findImportantLink1(@Query() query: GetPublicMediaQueryDto) {
    return {
      message: 'Public important link 1 media retrieved successfully.',
      data: await this.media.findImportantLinks(query, 'importantLink1'),
    };
  }

  @Get('important-link-2')
  async findImportantLink2(@Query() query: GetPublicMediaQueryDto) {
    return {
      message: 'Public important link 2 media retrieved successfully.',
      data: await this.media.findImportantLinks(query, 'importantLink2'),
    };
  }

  @Get('important-link-3')
  async findImportantLink3(@Query() query: GetPublicMediaQueryDto) {
    return {
      message: 'Public important link 3 media retrieved successfully.',
      data: await this.media.findImportantLinks(query, 'importantLink3'),
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
      await this.media.resolveOrganizationReference(organizationId),
    );
    response.setHeader('Content-Type', document.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(document.filename)}`,
    );
    document.stream.on('error', () => response.destroy());
    document.stream.pipe(response);
  }

  @Get(':id/download/hindi')
  async downloadHindi(
    @Param('id', ParseIntPipe) id: number,
    @Query('organization_id') organizationId: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const document = await this.media.publicDownloadHindi(
      id,
      await this.media.resolveOrganizationReference(organizationId),
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
