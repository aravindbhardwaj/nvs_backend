import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RegionsService } from './regions.service';

@Public()
@Controller('api/public/regions')
export class PublicRegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return {
      message: 'Regions retrieved successfully.',
      data: await this.regionsService.findPublic(query),
    };
  }

  @Get('uuid/:uuid')
  async findOneByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return {
      message: 'Region retrieved successfully.',
      data: await this.regionsService.findPublicOne({ uuid }),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Region retrieved successfully.',
      data: await this.regionsService.findPublicOne({ id }),
    };
  }
}
