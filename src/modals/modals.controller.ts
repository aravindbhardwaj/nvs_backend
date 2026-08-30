import {
  Body,
  Controller,
  Delete,
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
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateModalDto } from './dto/create-modal.dto';
import { GetModalsQueryDto } from './dto/get-modals-query.dto';
import { ReorderModalsDto } from './dto/reorder-modals.dto';
import { UpdateModalDto } from './dto/update-modal.dto';
import { ModalsService } from './modals.service';

@Controller('api/modals')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV)
export class ModalsController {
  constructor(private readonly modals: ModalsService) {}

  @Post()
  @RequirePermission('MODAL_CREATE')
  async create(
    @Body() dto: CreateModalDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Modal created successfully.',
      data: await this.modals.create(dto, user),
    };
  }

  @Get()
  @RequirePermission('MODAL_VIEW')
  async findAll(@Query() query: GetModalsQueryDto) {
    return {
      message: 'Modals retrieved successfully.',
      data: await this.modals.findAll(query),
    };
  }

  @Get(':id')
  @RequirePermission('MODAL_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Modal retrieved successfully.',
      data: await this.modals.findOne(id),
    };
  }

  @Put('reorder')
  @RequirePermission('MODAL_UPDATE')
  async reorder(
    @Body() dto: ReorderModalsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.modals.reorder(dto, user);
    return { message: 'Modals reordered successfully.', data: null };
  }

  @Put(':id')
  @RequirePermission('MODAL_UPDATE')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModalDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Modal updated successfully.',
      data: await this.modals.update(id, dto, user),
    };
  }

  @Patch(':id/activate')
  @RequirePermission('MODAL_UPDATE')
  async activate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Modal activated successfully.',
      data: await this.modals.setActive(id, true, user),
    };
  }

  @Patch(':id/deactivate')
  @RequirePermission('MODAL_UPDATE')
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Modal deactivated successfully.',
      data: await this.modals.setActive(id, false, user),
    };
  }

  @Delete(':id')
  @RequirePermission('MODAL_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Modal deleted successfully.',
      data: await this.modals.remove(id, user),
    };
  }
}
