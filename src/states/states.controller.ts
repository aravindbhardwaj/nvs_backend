import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';

import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetStatesQueryDto } from './dto/get-states-query.dto';
import { StatesService } from './states.service';

/** Read-only State Master endpoint. */
@Controller('api/states')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Get()
  @RequirePermission('STATE_VIEW')
  async findAll(@Query() query: GetStatesQueryDto) {
    return {
      message: 'States retrieved successfully.',
      data: await this.statesService.findAll(query),
    };
  }
}
