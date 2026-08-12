import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationTypesService } from './organization-types.service';

@Controller('api/organization-types')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class OrganizationTypesController {
  constructor(
    private readonly organizationTypesService: OrganizationTypesService,
  ) {}

  @Get()
  @RequirePermission('ORGANIZATION_VIEW')
  async findAll() {
    return {
      message: 'Organization types retrieved successfully.',
      data: await this.organizationTypesService.findAll(),
    };
  }
}
