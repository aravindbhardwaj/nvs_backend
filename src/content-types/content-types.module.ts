import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { ContentTypesController } from './content-types.controller';
import { ContentTypesService } from './content-types.service';

@Module({
  imports: [AuthModule],
  controllers: [ContentTypesController],
  providers: [ContentTypesService],
})
export class ContentTypesModule {}
