import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ReplaceUserPermissionsDto } from './dto/replace-user-permissions.dto';
import { UserPermissionsService } from './user-permissions.service';

@Controller('api/user-permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class UserPermissionsController {
  constructor(
    private readonly userPermissionsService: UserPermissionsService,
  ) {}

  @Get(':userId')
  async findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return {
      message: 'User permission overrides retrieved successfully.',
      data: await this.userPermissionsService.findByUser(userId),
    };
  }

  @Put(':userId')
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

  @Delete(':userId')
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
