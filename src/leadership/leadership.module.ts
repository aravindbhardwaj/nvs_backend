import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LeadershipController } from './leadership.controller';
import { LeadershipService } from './leadership.service';
import { PublicLeadershipController } from './public-leadership.controller';

@Module({
  imports: [AuthModule],
  controllers: [LeadershipController, PublicLeadershipController],
  providers: [LeadershipService],
})
export class LeadershipModule {}
