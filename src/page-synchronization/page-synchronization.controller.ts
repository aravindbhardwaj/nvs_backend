import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PageSynchronizationService } from './page-synchronization.service';

@Controller('api/page-synchronizations')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
@RequirePermission('PAGE_CREATE')
export class PageSynchronizationController {
  constructor(private readonly service: PageSynchronizationService) {}

  @Post('organizations/:uuid')
  @HttpCode(HttpStatus.ACCEPTED)
  async synchronizeOrganization(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page synchronization job accepted.',
      data: await this.service.enqueueOrganization(uuid, user.id),
    };
  }

  @Post('organization-types/:uuid')
  @HttpCode(HttpStatus.ACCEPTED)
  async synchronizeOrganizationType(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Bulk page synchronization job accepted.',
      data: await this.service.enqueueOrganizationType(uuid, user.id),
    };
  }

  @Get(':uuid/failures')
  async failures(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return {
      message: 'Page synchronization failures retrieved successfully.',
      data: await this.service.getFailures(uuid),
    };
  }

  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return {
      message: 'Page synchronization job retrieved successfully.',
      data: await this.service.getJob(uuid),
    };
  }
}
