import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { PagesController } from './pages.controller';
import { PublicPagesController } from './public-pages.controller';
import { PagesService } from './pages.service';

@Module({
  imports: [AuthModule],
  controllers: [PagesController, PublicPagesController],
  providers: [PagesService],
})
export class PagesModule {}
