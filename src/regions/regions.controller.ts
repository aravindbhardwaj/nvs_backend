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
import { CreateRegionDto } from './dto/create-region.dto';
import { GetRegionsQueryDto } from './dto/get-regions-query.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionsService } from './regions.service';

@Controller('api/regions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post()
  @RequirePermission('ORGANIZATION_CREATE')
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
  @RequirePermission('ORGANIZATION_VIEW')
  async findAll(@Query() query: GetRegionsQueryDto) {
    return {
      message: 'Regions retrieved successfully.',
      data: await this.regionsService.findAll(query),
    };
  }

  @Get(':id')
  @RequirePermission('ORGANIZATION_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Region retrieved successfully.',
      data: await this.regionsService.findOne(id),
    };
  }

  @Put(':id')
  @RequirePermission('ORGANIZATION_UPDATE')
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

  @Delete(':id')
  @RequirePermission('ORGANIZATION_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Region deleted successfully.',
      data: await this.regionsService.remove(id, user),
    };
  }

  @Patch(':id/restore')
  @RequirePermission('ORGANIZATION_UPDATE')
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
