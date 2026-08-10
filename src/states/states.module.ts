import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { StatesController } from './states.controller';
import { StatesService } from './states.service';

@Module({
  imports: [AuthModule],
  controllers: [StatesController],
  providers: [StatesService],
})
export class StatesModule {}
