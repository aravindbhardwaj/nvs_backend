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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetPermissionsQueryDto } from './dto/get-permissions-query.dto';
import { PermissionsService } from './permissions.service';

@Controller('api/permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  async findAll(@Query() query: GetPermissionsQueryDto) {
    return {
      message: 'Permissions retrieved successfully.',
      data: await this.permissionsService.findAll(query),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Permission retrieved successfully.',
      data: await this.permissionsService.findOne(id),
    };
  }
}
