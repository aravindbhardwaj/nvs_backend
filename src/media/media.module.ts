import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { MediaArchivalSchedulerService } from './media-archival-scheduler.service';
import { MediaController } from './media.controller';
import { PublicMediaController } from './public-media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [AuthModule],
  controllers: [MediaController, PublicMediaController],
  providers: [MediaService, MediaArchivalSchedulerService],
})
export class MediaModule {}
