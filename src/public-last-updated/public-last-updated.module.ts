import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicLastUpdatedController } from './public-last-updated.controller';
import { PublicLastUpdatedService } from './public-last-updated.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicLastUpdatedController],
  providers: [PublicLastUpdatedService],
})
export class PublicLastUpdatedModule {}
