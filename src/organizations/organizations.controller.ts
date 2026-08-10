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
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { GetOrganizationsQueryDto } from './dto/get-organizations-query.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';

@Controller('api/organizations')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @RequirePermission('ORGANIZATION_CREATE')
  async create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization created successfully.',
      data: await this.organizationsService.create(dto, user),
    };
  }

  @Get()
  @RequirePermission('ORGANIZATION_VIEW')
  async findAll(@Query() query: GetOrganizationsQueryDto) {
    return {
      message: 'Organizations retrieved successfully.',
      data: await this.organizationsService.findAll(query),
    };
  }

  @Get(':id')
  @RequirePermission('ORGANIZATION_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Organization retrieved successfully.',
      data: await this.organizationsService.findOne(id),
    };
  }

  @Put(':id')
  @RequirePermission('ORGANIZATION_UPDATE')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization updated successfully.',
      data: await this.organizationsService.update(id, dto, user),
    };
  }

  @Delete(':id')
  @RequirePermission('ORGANIZATION_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization deleted successfully.',
      data: await this.organizationsService.remove(id, user),
    };
  }

  @Patch(':id/restore')
  @RequirePermission('ORGANIZATION_UPDATE')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization restored successfully.',
      data: await this.organizationsService.restore(id, user),
    };
  }
}
