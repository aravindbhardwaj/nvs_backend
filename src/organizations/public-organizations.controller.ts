import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';

import { Public } from '../auth/decorators/public.decorator';
import { GetPublicOrganizationsQueryDto } from './dto/get-public-organizations-query.dto';
import { OrganizationsService } from './organizations.service';
import { ORGANIZATION_PROFILE_IMAGE_ROOT } from './organization-profile-image.storage';

@Public()
@Controller('api/public')
export class PublicOrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get('organizations/profile-images/:filename')
  profileImage(
    @Param('filename') filename: string,
    @Res() response: Response,
  ): void {
    if (!/^[0-9a-f-]{36}\.(?:jpe?g|png|webp)$/i.test(filename))
      throw new NotFoundException('Organization image not found.');
    const path = join(ORGANIZATION_PROFILE_IMAGE_ROOT, filename);
    if (!existsSync(path))
      throw new NotFoundException('Organization image not found.');
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    response.type(contentTypes[extname(filename).toLowerCase()]);
    response.sendFile(path);
  }

  @Get('regional-offices')
  async regionalOffices(@Query() query: GetPublicOrganizationsQueryDto) {
    return {
      message: 'Regional offices retrieved successfully.',
      data: await this.organizations.findPublicRegionalOffices(query),
    };
  }

  @Get('nlis')
  async nlis(@Query() query: GetPublicOrganizationsQueryDto) {
    return {
      message: 'NLIs retrieved successfully.',
      data: await this.organizations.findPublicNlis(query),
    };
  }
}
