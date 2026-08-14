import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateMenuDto } from './dto/create-menu.dto';
import { GetMenuNavigationQueryDto } from './dto/get-menu-navigation-query.dto';
import { GetMenusQueryDto } from './dto/get-menus-query.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenusService } from './menus.service';

@Controller('api/menus')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @RequirePermission('MENU_CREATE')
  async create(
    @Body() dto: CreateMenuDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Menu created successfully.',
      data: await this.menusService.create(dto, user),
    };
  }

  @Get()
  @RequirePermission('MENU_VIEW')
  async findAll(@Query() query: GetMenusQueryDto) {
    return {
      message: 'Menus retrieved successfully.',
      data: await this.menusService.findAll(query),
    };
  }

  @Get('navigation')
  @Public()
  @Roles()
  async navigation(@Query() query: GetMenuNavigationQueryDto) {
    return {
      message: 'Menu navigation retrieved successfully.',
      data: await this.menusService.navigation(query),
    };
  }

  @Get(':id')
  @RequirePermission('MENU_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Menu retrieved successfully.',
      data: await this.menusService.findOne(id),
    };
  }

  @Put(':id')
  @RequirePermission('MENU_UPDATE')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Menu updated successfully.',
      data: await this.menusService.update(id, dto, user),
    };
  }

  @Patch(':id/activate')
  @RequirePermission('MENU_UPDATE')
  async activate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Menu activated successfully.',
      data: await this.menusService.setActive(id, true, user),
    };
  }

  @Patch(':id/deactivate')
  @RequirePermission('MENU_UPDATE')
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Menu deactivated successfully.',
      data: await this.menusService.setActive(id, false, user),
    };
  }
}
