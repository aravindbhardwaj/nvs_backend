import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
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
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('uuid/:uuid')
  @RequirePermission('USER_VIEW')
  async findOneByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const id = await this.usersService.resolveUuid(uuid);
    return this.findOne(id);
  }

  @Post('uuid/:uuid/update')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async updateByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.usersService.resolveUuid(uuid);
    return this.update(id, dto, user);
  }

  @Post('uuid/:uuid/activate')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async activateByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.usersService.resolveUuid(uuid);
    return this.activate(id, user);
  }

  @Post('uuid/:uuid/deactivate')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async deactivateByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.usersService.resolveUuid(uuid);
    return this.deactivate(id, user);
  }

  @Post('uuid/:uuid/reset-password')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async resetPasswordByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: ResetUserPasswordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.usersService.resolveUuid(uuid);
    return this.resetPassword(id, dto, user);
  }

  @Post('uuid/:uuid/delete')
  @HttpCode(200)
  @RequirePermission('USER_DELETE')
  async removeByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.usersService.resolveUuid(uuid);
    return this.remove(id, user);
  }

  @Post('uuid/:uuid/restore')
  @HttpCode(200)
  @RequirePermission('USER_RESTORE')
  async restoreByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.usersService.resolveUuid(uuid);
    return this.restore(id, user);
  }

  @Post()
  @RequirePermission('USER_CREATE')
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'User created successfully.',
      data: await this.usersService.create(dto, user),
    };
  }

  @Get()
  @RequirePermission('USER_VIEW')
  async findAll(@Query() query: GetUsersQueryDto) {
    return {
      message: 'Users retrieved successfully.',
      data: await this.usersService.findAll(query),
    };
  }

  @Get(':id')
  @RequirePermission('USER_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'User retrieved successfully.',
      data: await this.usersService.findOne(id),
    };
  }

  @Post(':id/update')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'User updated successfully.',
      data: await this.usersService.update(id, dto, user),
    };
  }

  @Post(':id/activate')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async activate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'User activated successfully.',
      data: await this.usersService.activate(id, user),
    };
  }

  @Post(':id/deactivate')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'User deactivated successfully.',
      data: await this.usersService.deactivate(id, user),
    };
  }

  @Post(':id/reset-password')
  @HttpCode(200)
  @RequirePermission('USER_UPDATE')
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetUserPasswordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'User password reset successfully.',
      data: await this.usersService.resetPassword(id, dto, user),
    };
  }

  @Post(':id/delete')
  @HttpCode(200)
  @RequirePermission('USER_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'User deleted successfully.',
      data: await this.usersService.remove(id, user),
    };
  }

  @Post(':id/restore')
  @HttpCode(200)
  @RequirePermission('USER_RESTORE')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'User restored successfully.',
      data: await this.usersService.restore(id, user),
    };
  }
}
