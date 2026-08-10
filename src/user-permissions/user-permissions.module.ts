import { Module } from '@nestjs/common';

import { RolesGuard } from '../auth/guards/roles.guard';
import { UserPermissionsController } from './user-permissions.controller';
import { UserPermissionsService } from './user-permissions.service';

@Module({
  controllers: [UserPermissionsController],
  providers: [UserPermissionsService, RolesGuard],
})
export class UserPermissionsModule {}
