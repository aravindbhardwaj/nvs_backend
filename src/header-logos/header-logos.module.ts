import { Module } from '@nestjs/common';
import { HeaderLogosController } from './header-logos.controller';
import { HeaderLogosService } from './header-logos.service';
import { PublicHeaderLogosController } from './public-header-logos.controller';

@Module({
  controllers: [HeaderLogosController, PublicHeaderLogosController],
  providers: [HeaderLogosService],
})
export class HeaderLogosModule {}
