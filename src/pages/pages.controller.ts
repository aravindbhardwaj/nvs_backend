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
import { CreatePageDto } from './dto/create-page.dto';
import { GetPagesQueryDto } from './dto/get-pages-query.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';

@Controller('api/pages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  async create(
    @Body() dto: CreatePageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page created successfully.',
      data: await this.pagesService.create(dto, user),
    };
  }

  @Get()
  async findAll(
    @Query() query: GetPagesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Pages retrieved successfully.',
      data: await this.pagesService.findAll(query, user),
    };
  }

  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page retrieved successfully.',
      data: await this.pagesService.findBySlug(slug, user),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page retrieved successfully.',
      data: await this.pagesService.findOne(id, user),
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page updated successfully.',
      data: await this.pagesService.update(id, dto, user),
    };
  }

  @Patch(':id/publish')
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page published successfully.',
      data: await this.pagesService.publish(id, user),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page unpublished successfully.',
      data: await this.pagesService.unpublish(id, user),
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page deleted successfully.',
      data: await this.pagesService.remove(id, user),
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page restored successfully.',
      data: await this.pagesService.restore(id, user),
    };
  }
}
