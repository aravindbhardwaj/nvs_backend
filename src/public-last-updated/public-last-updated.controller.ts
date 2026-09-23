import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { PublicLastUpdatedService } from './public-last-updated.service';

@Public()
@Controller('api/public/organizations')
export class PublicLastUpdatedController {
  constructor(private readonly lastUpdated: PublicLastUpdatedService) {}

  @Get(':organizationUuid/last-updated')
  async getLastUpdated(
    @Param('organizationUuid', ParseUUIDPipe) organizationUuid: string,
  ) {
    return {
      message: 'Public last updated date retrieved successfully.',
      data: await this.lastUpdated.getLastUpdated(organizationUuid),
    };
  }
}
