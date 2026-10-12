import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PageSynchronizationController } from './page-synchronization.controller';
import { PageSynchronizationService } from './page-synchronization.service';

@Module({
  imports: [AuthModule],
  controllers: [PageSynchronizationController],
  providers: [PageSynchronizationService],
  exports: [PageSynchronizationService],
})
export class PageSynchronizationModule {}
