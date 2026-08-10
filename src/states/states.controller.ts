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
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateStateDto } from './dto/create-state.dto';
import { GetStatesQueryDto } from './dto/get-states-query.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { StatesService } from './states.service';

@Controller('api/states')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Post()
  async create(
    @Body() dto: CreateStateDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'State created successfully.',
      data: await this.statesService.create(dto, user),
    };
  }

  @Get()
  async findAll(@Query() query: GetStatesQueryDto) {
    return {
      message: 'States retrieved successfully.',
      data: await this.statesService.findAll(query),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'State retrieved successfully.',
      data: await this.statesService.findOne(id),
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStateDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'State updated successfully.',
      data: await this.statesService.update(id, dto, user),
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'State deleted successfully.',
      data: await this.statesService.remove(id, user),
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'State restored successfully.',
      data: await this.statesService.restore(id, user),
    };
  }
}
