import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { RegionsController } from './regions.controller';
import { RegionsService } from './regions.service';
import { PublicRegionsController } from './public-regions.controller';

@Module({
  imports: [AuthModule],
  controllers: [RegionsController, PublicRegionsController],
  providers: [RegionsService],
})
export class RegionsModule {}
