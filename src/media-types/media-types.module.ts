import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { MediaTypesController } from './media-types.controller';
import { MediaTypesService } from './media-types.service';

@Module({
  imports: [AuthModule],
  controllers: [MediaTypesController],
  providers: [MediaTypesService],
})
export class MediaTypesModule {}
