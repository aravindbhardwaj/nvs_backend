import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetPermissionsQueryDto } from './dto/get-permissions-query.dto';
import { PermissionsService } from './permissions.service';

@Controller('api/permissions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermission('PERMISSION_VIEW')
  async findAll(@Query() query: GetPermissionsQueryDto) {
    return {
      message: 'Permissions retrieved successfully.',
      data: await this.permissionsService.findAll(query),
    };
  }

  @Get(':id')
  @RequirePermission('PERMISSION_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Permission retrieved successfully.',
      data: await this.permissionsService.findOne(id),
    };
  }
}
