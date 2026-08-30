import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ModalsController } from './modals.controller';
import { ModalsService } from './modals.service';
import { PublicModalsController } from './public-modals.controller';

@Module({
  imports: [AuthModule],
  controllers: [ModalsController, PublicModalsController],
  providers: [ModalsService],
})
export class ModalsModule {}
