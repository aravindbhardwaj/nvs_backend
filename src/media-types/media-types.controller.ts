import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateMediaTypeDto } from './dto/create-media-type.dto';
import { GetMediaTypesQueryDto } from './dto/get-media-types-query.dto';
import { UpdateMediaTypeDto } from './dto/update-media-type.dto';
import { MediaTypesService } from './media-types.service';

@Controller('api/media-types')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class MediaTypesController {
  constructor(private readonly mediaTypesService: MediaTypesService) {}

  @Post()
  @RequirePermission('ORGANIZATION_CREATE')
  async create(
    @Body() dto: CreateMediaTypeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Media type created successfully.',
      data: await this.mediaTypesService.create(dto, user),
    };
  }

  @Get()
  @RequirePermission('ORGANIZATION_VIEW')
  async findAll(@Query() query: GetMediaTypesQueryDto) {
    return {
      message: 'Media types retrieved successfully.',
      data: await this.mediaTypesService.findAll(query),
    };
  }

  @Get(':id')
  @RequirePermission('ORGANIZATION_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Media type retrieved successfully.',
      data: await this.mediaTypesService.findOne(id),
    };
  }

  @Put(':id')
  @RequirePermission('ORGANIZATION_UPDATE')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMediaTypeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Media type updated successfully.',
      data: await this.mediaTypesService.update(id, dto, user),
    };
  }

  @Delete(':id')
  @RequirePermission('ORGANIZATION_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Media type deleted successfully.',
      data: await this.mediaTypesService.remove(id, user),
    };
  }

  @Patch(':id/restore')
  @RequirePermission('ORGANIZATION_UPDATE')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Media type restored successfully.',
      data: await this.mediaTypesService.restore(id, user),
    };
  }
}
