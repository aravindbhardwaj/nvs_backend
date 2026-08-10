import { Module } from '@nestjs/common';

import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, RolesGuard],
})
export class PermissionsModule {}
