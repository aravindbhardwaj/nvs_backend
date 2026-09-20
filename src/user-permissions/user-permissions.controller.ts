import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  ParseIntPipe,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ReplaceUserPermissionsDto } from './dto/replace-user-permissions.dto';
import { UserPermissionsService } from './user-permissions.service';

@Controller('api/user-permissions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class UserPermissionsController {
  constructor(
    private readonly userPermissionsService: UserPermissionsService,
  ) {}

  @Get('uuid/:uuid')
  @RequirePermission('USER_VIEW')
  async findByUserByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const userId = await this.userPermissionsService.resolveUuid(uuid);
    return this.findByUser(userId);
  }

  @Post('uuid/:uuid/update')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async replaceByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: ReplaceUserPermissionsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = await this.userPermissionsService.resolveUuid(uuid);
    return this.replace(userId, dto, user);
  }

  @Post('uuid/:uuid/delete')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async removeByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = await this.userPermissionsService.resolveUuid(uuid);
    return this.remove(userId, user);
  }

  @Get(':userId')
  @RequirePermission('USER_VIEW')
  async findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return {
      message: 'User permission overrides retrieved successfully.',
      data: await this.userPermissionsService.findByUser(userId),
    };
  }

  @Post(':userId/update')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async replace(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: ReplaceUserPermissionsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'User permission overrides replaced successfully.',
      data: await this.userPermissionsService.replace(userId, dto, user),
    };
  }

  @Post(':userId/delete')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async remove(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'User permission overrides removed successfully.',
      data: await this.userPermissionsService.remove(userId, user),
    };
  }
}
