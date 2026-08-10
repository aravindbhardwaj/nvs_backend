import { Module } from '@nestjs/common';

import { RolesGuard } from '../auth/guards/roles.guard';
import { RolePermissionsController } from './role-permissions.controller';
import { RolePermissionsService } from './role-permissions.service';

@Module({
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService, RolesGuard],
})
export class RolePermissionsModule {}
