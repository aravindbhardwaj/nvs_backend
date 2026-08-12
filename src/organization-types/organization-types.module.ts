import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { OrganizationTypesController } from './organization-types.controller';
import { OrganizationTypesService } from './organization-types.service';

@Module({
  imports: [AuthModule],
  controllers: [OrganizationTypesController],
  providers: [OrganizationTypesService],
})
export class OrganizationTypesModule {}
