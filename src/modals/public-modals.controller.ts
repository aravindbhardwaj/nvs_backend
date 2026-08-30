import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { GetPublicModalsQueryDto } from './dto/get-public-modals-query.dto';
import { ModalsService } from './modals.service';

@Public()
@Controller('api/public/modals')
export class PublicModalsController {
  constructor(private readonly modals: ModalsService) {}

  @Get()
  async findAll(@Query() query: GetPublicModalsQueryDto) {
    return {
      message: 'Active modals retrieved successfully.',
      data: await this.modals.findPublic(query),
    };
  }
}
