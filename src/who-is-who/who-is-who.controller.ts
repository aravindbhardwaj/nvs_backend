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
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { WhoIsWhoService } from './who-is-who.service';
import {
  CreateOfficerDto,
  UpdateOfficerDto,
  GetOfficersQueryDto,
} from './who-is-who.dto';

@Controller('api/who-is-who')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV)
export class WhoIsWhoController {
  constructor(private readonly service: WhoIsWhoService) {}
  @Post()
  @RequirePermission('WHO_IS_WHO_CREATE')
  async create(
    @Body() dto: CreateOfficerDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return {
      message: 'Officer created successfully.',
      data: await this.service.create(dto, actor),
    };
  }
  @Get()
  @RequirePermission('WHO_IS_WHO_VIEW')
  async findAll(
    @Query() query: GetOfficersQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return {
      message: 'Officers retrieved successfully.',
      data: await this.service.findAll(query, actor),
    };
  }
  @Get('uuid/:uuid')
  @RequirePermission('WHO_IS_WHO_VIEW')
  async findOneByUuid(
    @Param('uuid', ParseUUIDPipe) key: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return {
      message: 'Officer retrieved successfully.',
      data: await this.service.findOne(key, actor),
    };
  }
  @Post('uuid/:uuid/update')
  @HttpCode(200)
  @RequirePermission('WHO_IS_WHO_UPDATE')
  async updateByUuid(
    @Param('uuid', ParseUUIDPipe) key: string,
    @Body() dto: UpdateOfficerDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return {
      message: 'Officer updated successfully.',
      data: await this.service.update(key, dto, actor),
    };
  }
  @Post('uuid/:uuid/delete')
  @HttpCode(200)
  @RequirePermission('WHO_IS_WHO_DELETE')
  async removeByUuid(
    @Param('uuid', ParseUUIDPipe) key: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return {
      message: 'Officer deleted successfully.',
      data: await this.service.remove(key, actor),
    };
  }
  @Get(':id')
  @RequirePermission('WHO_IS_WHO_VIEW')
  async findOne(
    @Param('id', ParseIntPipe) key: number,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return {
      message: 'Officer retrieved successfully.',
      data: await this.service.findOne(key, actor),
    };
  }
  @Post(':id/update')
  @HttpCode(200)
  @RequirePermission('WHO_IS_WHO_UPDATE')
  async update(
    @Param('id', ParseIntPipe) key: number,
    @Body() dto: UpdateOfficerDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return {
      message: 'Officer updated successfully.',
      data: await this.service.update(key, dto, actor),
    };
  }
  @Post(':id/delete')
  @HttpCode(200)
  @RequirePermission('WHO_IS_WHO_DELETE')
  async remove(
    @Param('id', ParseIntPipe) key: number,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return {
      message: 'Officer deleted successfully.',
      data: await this.service.remove(key, actor),
    };
  }
}
