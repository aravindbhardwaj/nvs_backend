import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
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

  @Get('uuid/:uuid')
  @RequirePermission('CONTENT_TYPE_VIEW')
  async findOneByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const id = await this.contentTypesService.resolveUuid(uuid);
    return this.findOne(id);
  }

  @Post('uuid/:uuid/update')
  @HttpCode(200)
  @RequirePermission('CONTENT_TYPE_UPDATE')
  async updateByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateContentTypeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.contentTypesService.resolveUuid(uuid);
    return this.update(id, dto, user);
  }

  @Post('uuid/:uuid/delete')
  @HttpCode(200)
  @RequirePermission('CONTENT_TYPE_DELETE')
  async removeByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.contentTypesService.resolveUuid(uuid);
    return this.remove(id, user);
  }

  @Post('uuid/:uuid/restore')
  @HttpCode(200)
  @RequirePermission('CONTENT_TYPE_UPDATE')
  async restoreByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.contentTypesService.resolveUuid(uuid);
    return this.restore(id, user);
  }

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
  @Roles(Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV)
  @RequirePermission('PAGE_VIEW')
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

  @Post(':id/update')
  @HttpCode(200)
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

  @Post(':id/delete')
  @HttpCode(200)
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

  @Post(':id/restore')
  @HttpCode(200)
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
