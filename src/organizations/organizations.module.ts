import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { OrganizationsController } from './organizations.controller';
import { PublicJnvsController } from './public-jnvs.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [AuthModule],
  controllers: [OrganizationsController, PublicJnvsController],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
