import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { MenusController } from './menus.controller';
import { PublicMenusController } from './public-menus.controller';
import { MenusService } from './menus.service';

@Module({
  imports: [AuthModule],
  controllers: [MenusController, PublicMenusController],
  providers: [MenusService],
})
export class MenusModule {}
