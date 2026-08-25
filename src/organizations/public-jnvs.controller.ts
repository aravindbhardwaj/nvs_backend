import { Controller, Get, Query } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { GetPublicJnvsQueryDto } from './dto/get-public-jnvs-query.dto';
import { OrganizationsService } from './organizations.service';

@Public()
@Controller('api/public/jnvs')
export class PublicJnvsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get('state-map')
  async stateMap() {
    return {
      message: 'JNV state map retrieved successfully.',
      data: await this.organizations.findPublicJnvStateMap(),
    };
  }

  @Get()
  async findAll(@Query() query: GetPublicJnvsQueryDto) {
    return {
      message: 'JNVs retrieved successfully.',
      data: await this.organizations.findPublicJnvs(query),
    };
  }
}
