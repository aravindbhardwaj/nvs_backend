import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WhoIsWhoController } from './who-is-who.controller';
import { PublicWhoIsWhoController } from './public-who-is-who.controller';
import { WhoIsWhoService } from './who-is-who.service';
@Module({
  imports: [AuthModule],
  controllers: [WhoIsWhoController, PublicWhoIsWhoController],
  providers: [WhoIsWhoService],
})
export class WhoIsWhoModule {}
