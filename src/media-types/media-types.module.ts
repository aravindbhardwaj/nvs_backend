import { Module } from '@nestjs/common';

import { MediaTypesController } from './media-types.controller';
import { MediaTypesService } from './media-types.service';

@Module({
  controllers: [MediaTypesController],
  providers: [MediaTypesService],
})
export class MediaTypesModule {}
