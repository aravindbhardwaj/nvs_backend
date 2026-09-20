import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { WhoIsWhoService } from './who-is-who.service';
import { GetPublicOfficersQueryDto } from './who-is-who.dto';
@Public()
@Controller('api/public/who-is-who')
export class PublicWhoIsWhoController {
  constructor(private readonly service: WhoIsWhoService) {}
  @Get()
  async findAll(@Query() query: GetPublicOfficersQueryDto) {
    return {
      message: 'Officers retrieved successfully.',
      data: await this.service.findPublic(query),
    };
  }
  @Get('uuid/:uuid')
  async findOneByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return {
      message: 'Officer retrieved successfully.',
      data: await this.service.findPublicOne(uuid),
    };
  }
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Officer retrieved successfully.',
      data: await this.service.findPublicOne(id),
    };
  }
}
