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
import { ContentTypesService } from './content-types.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { GetContentTypesQueryDto } from './dto/get-content-types-query.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';

@Controller('api/content-types')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class ContentTypesController {
  constructor(private readonly contentTypesService: ContentTypesService) {}

  @Post()
  @RequirePermission('CONTENT_TYPE_CREATE')
  async create(
    @Body() dto: CreateContentTypeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Content type created successfully.',
      data: await this.contentTypesService.create(dto, user),
    };
  }

  @Get()
  @RequirePermission('CONTENT_TYPE_VIEW')
  async findAll(@Query() query: GetContentTypesQueryDto) {
    return {
      message: 'Content types retrieved successfully.',
      data: await this.contentTypesService.findAll(query),
    };
  }

  @Get(':id')
  @RequirePermission('CONTENT_TYPE_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Content type retrieved successfully.',
      data: await this.contentTypesService.findOne(id),
    };
  }

  @Put(':id')
  @RequirePermission('CONTENT_TYPE_UPDATE')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContentTypeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Content type updated successfully.',
      data: await this.contentTypesService.update(id, dto, user),
    };
  }

  @Delete(':id')
  @RequirePermission('CONTENT_TYPE_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Content type deleted successfully.',
      data: await this.contentTypesService.remove(id, user),
    };
  }

  @Patch(':id/restore')
  @RequirePermission('CONTENT_TYPE_UPDATE')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Content type restored successfully.',
      data: await this.contentTypesService.restore(id, user),
    };
  }
}
