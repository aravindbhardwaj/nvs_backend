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
import { CreateRegionDto } from './dto/create-region.dto';
import { GetRegionsQueryDto } from './dto/get-regions-query.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionsService } from './regions.service';

@Controller('api/regions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get('uuid/:uuid')
  @RequirePermission('REGION_VIEW')
  async findOneByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const id = await this.regionsService.resolveUuid(uuid);
    return this.findOne(id);
  }

  @Post('uuid/:uuid/update')
  @HttpCode(200)
  @RequirePermission('REGION_UPDATE')
  async updateByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateRegionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.regionsService.resolveUuid(uuid);
    return this.update(id, dto, user);
  }

  @Post('uuid/:uuid/delete')
  @HttpCode(200)
  @RequirePermission('REGION_DELETE')
  async removeByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.regionsService.resolveUuid(uuid);
    return this.remove(id, user);
  }

  @Post('uuid/:uuid/restore')
  @HttpCode(200)
  @RequirePermission('REGION_UPDATE')
  async restoreByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.regionsService.resolveUuid(uuid);
    return this.restore(id, user);
  }

  @Post()
  @RequirePermission('REGION_CREATE')
  async create(
    @Body() dto: CreateRegionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Region created successfully.',
      data: await this.regionsService.create(dto, user),
    };
  }

  @Get()
  @RequirePermission('REGION_VIEW')
  async findAll(@Query() query: GetRegionsQueryDto) {
    return {
      message: 'Regions retrieved successfully.',
      data: await this.regionsService.findAll(query),
    };
  }

  @Get(':id')
  @RequirePermission('REGION_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Region retrieved successfully.',
      data: await this.regionsService.findOne(id),
    };
  }

  @Post(':id/update')
  @HttpCode(200)
  @RequirePermission('REGION_UPDATE')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Region updated successfully.',
      data: await this.regionsService.update(id, dto, user),
    };
  }

  @Post(':id/delete')
  @HttpCode(200)
  @RequirePermission('REGION_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Region deleted successfully.',
      data: await this.regionsService.remove(id, user),
    };
  }

  @Post(':id/restore')
  @HttpCode(200)
  @RequirePermission('REGION_UPDATE')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Region restored successfully.',
      data: await this.regionsService.restore(id, user),
    };
  }
}
