import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';

import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetDistrictsQueryDto } from './dto/get-districts-query.dto';
import { DistrictsService } from './districts.service';

/** Read-only District Master endpoints. */
@Controller('api/districts')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get()
  @RequirePermission('DISTRICT_VIEW')
  async findAll(@Query() query: GetDistrictsQueryDto) {
    return {
      message: 'Districts retrieved successfully.',
      data: await this.districtsService.findAll(query),
    };
  }
}
