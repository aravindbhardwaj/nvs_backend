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
import { OrganizationOwned } from '../auth/decorators/organization-owned-resource.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationOwnershipGuard } from '../auth/guards/organization-ownership.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreatePageDto } from './dto/create-page.dto';
import { GetPagesQueryDto } from './dto/get-pages-query.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';

@Controller('api/pages')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
  PermissionsGuard,
  OrganizationOwnershipGuard,
)
@Roles(Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV)
@OrganizationOwned('page')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('uuid/:uuid')
  @RequirePermission('PAGE_VIEW')
  async findOneByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.pagesService.resolveUuid(uuid);
    return this.findOne(id, user);
  }

  @Post('uuid/:uuid/update')
  @HttpCode(200)
  @RequirePermission('PAGE_UPDATE')
  async updateByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdatePageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.pagesService.resolveUuid(uuid);
    return this.update(id, dto, user);
  }

  @Post('uuid/:uuid/publish')
  @HttpCode(200)
  @RequirePermission('PAGE_UPDATE')
  async publishByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.pagesService.resolveUuid(uuid);
    return this.publish(id, user);
  }

  @Post('uuid/:uuid/unpublish')
  @HttpCode(200)
  @RequirePermission('PAGE_UPDATE')
  async unpublishByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.pagesService.resolveUuid(uuid);
    return this.unpublish(id, user);
  }

  @Post('uuid/:uuid/delete')
  @HttpCode(200)
  @RequirePermission('PAGE_DELETE')
  async removeByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.pagesService.resolveUuid(uuid);
    return this.remove(id, user);
  }

  @Post('uuid/:uuid/restore')
  @HttpCode(200)
  @RequirePermission('PAGE_UPDATE')
  async restoreByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.pagesService.resolveUuid(uuid);
    return this.restore(id, user);
  }

  @Post()
  @RequirePermission('PAGE_CREATE')
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
  @RequirePermission('PAGE_VIEW')
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
  @RequirePermission('PAGE_VIEW')
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
  @RequirePermission('PAGE_VIEW')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page retrieved successfully.',
      data: await this.pagesService.findOne(id, user),
    };
  }

  @Post(':id/update')
  @HttpCode(200)
  @RequirePermission('PAGE_UPDATE')
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

  @Post(':id/publish')
  @HttpCode(200)
  @RequirePermission('PAGE_UPDATE')
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page published successfully.',
      data: await this.pagesService.publish(id, user),
    };
  }

  @Post(':id/unpublish')
  @HttpCode(200)
  @RequirePermission('PAGE_UPDATE')
  async unpublish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page unpublished successfully.',
      data: await this.pagesService.unpublish(id, user),
    };
  }

  @Post(':id/delete')
  @HttpCode(200)
  @RequirePermission('PAGE_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Page deleted successfully.',
      data: await this.pagesService.remove(id, user),
    };
  }

  @Post(':id/restore')
  @HttpCode(200)
  @RequirePermission('PAGE_UPDATE')
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
