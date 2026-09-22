import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { GetGalleriesQueryDto } from './dto/get-galleries-query.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { GalleryAlbumsService } from './gallery-albums.service';

@Controller('api/galleries')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV)
export class GalleryAlbumsController {
  constructor(private readonly galleries: GalleryAlbumsService) {}

  @Post() @RequirePermission('GALLERY_CREATE') async create(
    @Body() dto: CreateGalleryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Gallery created successfully.',
      data: await this.galleries.create(dto, user),
    };
  }

  @Get() @RequirePermission('GALLERY_VIEW') async findAll(
    @Query() query: GetGalleriesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Galleries retrieved successfully.',
      data: await this.galleries.findAll(query, user),
    };
  }

  @Get('uuid/:uuid') @RequirePermission('GALLERY_VIEW') async findOne(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Gallery retrieved successfully.',
      data: await this.galleries.findOne(uuid, user),
    };
  }

  @Post('uuid/:uuid/update')
  @HttpCode(200)
  @RequirePermission('GALLERY_UPDATE')
  async update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateGalleryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Gallery updated successfully.',
      data: await this.galleries.update(uuid, dto, user),
    };
  }

  @Post('uuid/:uuid/delete')
  @HttpCode(200)
  @RequirePermission('GALLERY_DELETE')
  async remove(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Gallery deleted successfully.',
      data: await this.galleries.remove(uuid, user),
    };
  }
}
