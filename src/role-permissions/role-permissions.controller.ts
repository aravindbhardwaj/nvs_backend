import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Put,
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
import { ReplaceRolePermissionsDto } from './dto/replace-role-permissions.dto';
import { RolePermissionsService } from './role-permissions.service';

@Controller('api/role-permissions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Get(':role')
  @RequirePermission('ORGANIZATION_VIEW')
  async findByRole(@Param('role', new ParseEnumPipe(Role)) role: Role) {
    return {
      message: 'Role permissions retrieved successfully.',
      data: await this.rolePermissionsService.findByRole(role),
    };
  }

  @Put(':role')
  @RequirePermission('ORGANIZATION_UPDATE')
  async replace(
    @Param('role', new ParseEnumPipe(Role)) role: Role,
    @Body() dto: ReplaceRolePermissionsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Role permissions updated successfully.',
      data: await this.rolePermissionsService.replace(role, dto, user),
    };
  }
}
