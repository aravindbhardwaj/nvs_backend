import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import type { Request } from 'express';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { GetOrganizationsQueryDto } from './dto/get-organizations-query.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';
import { OrganizationsService } from './organizations.service';
import {
  cleanupOrganizationProfileImage,
  MAX_ORGANIZATION_PROFILE_IMAGE_SIZE,
  organizationProfileImageStorage,
  validateOrganizationProfileImageContent,
  validateOrganizationProfileImageFile,
} from './organization-profile-image.storage';

const profileImageUploadOptions = {
  storage: organizationProfileImageStorage,
  limits: { fileSize: MAX_ORGANIZATION_PROFILE_IMAGE_SIZE, files: 1 },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, accept: boolean) => void,
  ) => {
    try {
      validateOrganizationProfileImageFile(file);
      callback(null, true);
    } catch (error) {
      callback(error as Error, false);
    }
  },
};

@Controller('api/organizations')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('uuid/:uuid')
  @RequirePermission('ORGANIZATION_VIEW')
  async findOneByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const id = await this.organizationsService.resolveUuid(uuid);
    return this.findOne(id);
  }

  @Post('uuid/:uuid/update')
  @HttpCode(200)
  @RequirePermission('ORGANIZATION_UPDATE')
  async updateByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.organizationsService.resolveUuid(uuid);
    return this.update(id, dto, user);
  }

  @Post('uuid/:uuid/profile')
  @HttpCode(200)
  @RequirePermission('ORGANIZATION_UPDATE')
  @UseInterceptors(FileInterceptor('image_url', profileImageUploadOptions))
  async updateProfileByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateOrganizationProfileDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: Request,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (dto.short_description === undefined && !file)
      throw new BadRequestException(
        'At least one of short_description or image_url is required.',
      );

    try {
      if (file) await validateOrganizationProfileImageContent(file);
      const configuredBaseUrl =
        process.env.ORGANIZATION_PROFILE_IMAGE_BASE_URL?.replace(/\/$/, '');
      const baseUrl =
        configuredBaseUrl ?? `${request.protocol}://${request.get('host')}`;
      const imageUrl = file
        ? `${baseUrl}/api/public/organizations/profile-images/${file.filename}`
        : undefined;
      return {
        message: 'Organization profile updated successfully.',
        data: await this.organizationsService.updateProfileByUuid(
          uuid,
          { short_description: dto.short_description, image_url: imageUrl },
          user,
        ),
      };
    } catch (error) {
      await cleanupOrganizationProfileImage(file);
      throw error;
    }
  }

  @Post('uuid/:uuid/delete')
  @HttpCode(200)
  @RequirePermission('ORGANIZATION_DELETE')
  async removeByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.organizationsService.resolveUuid(uuid);
    return this.remove(id, user);
  }

  @Post('uuid/:uuid/restore')
  @HttpCode(200)
  @RequirePermission('ORGANIZATION_UPDATE')
  async restoreByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.organizationsService.resolveUuid(uuid);
    return this.restore(id, user);
  }

  @Post()
  @RequirePermission('ORGANIZATION_CREATE')
  async create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization created successfully.',
      data: await this.organizationsService.create(dto, user),
    };
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.HEADQUARTER)
  async findAll(@Query() query: GetOrganizationsQueryDto) {
    return {
      message: 'Organizations retrieved successfully.',
      data: await this.organizationsService.findAll(query),
    };
  }

  @Get('master')
  @RequirePermission('ORGANIZATION_VIEW')
  async findMaster(@Query() query: GetOrganizationsQueryDto) {
    return {
      message: 'Organization master retrieved successfully.',
      data: await this.organizationsService.findMaster(query),
    };
  }

  @Get(':id')
  @RequirePermission('ORGANIZATION_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Organization retrieved successfully.',
      data: await this.organizationsService.findOne(id),
    };
  }

  @Post(':id/update')
  @HttpCode(200)
  @RequirePermission('ORGANIZATION_UPDATE')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization updated successfully.',
      data: await this.organizationsService.update(id, dto, user),
    };
  }

  @Post(':id/delete')
  @HttpCode(200)
  @RequirePermission('ORGANIZATION_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization deleted successfully.',
      data: await this.organizationsService.remove(id, user),
    };
  }

  @Post(':id/restore')
  @HttpCode(200)
  @RequirePermission('ORGANIZATION_UPDATE')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization restored successfully.',
      data: await this.organizationsService.restore(id, user),
    };
  }
}
