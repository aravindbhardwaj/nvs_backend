import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrganizationLeadershipController } from './organization-leadership.controller';
import { OrganizationLeadershipService } from './organization-leadership.service';
import { PublicOrganizationLeadershipController } from './public-organization-leadership.controller';

@Module({
  imports: [AuthModule],
  controllers: [
    OrganizationLeadershipController,
    PublicOrganizationLeadershipController,
  ],
  providers: [OrganizationLeadershipService],
})
export class OrganizationLeadershipModule {}
