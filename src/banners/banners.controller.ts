import {
  BadRequestException,
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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import type { Response } from 'express';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrganizationOwned } from '../auth/decorators/organization-owned-resource.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationOwnershipGuard } from '../auth/guards/organization-ownership.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { MAX_BANNER_UPLOAD_SIZE } from './banner.constants';
import { bannerStorage, validateBannerFile } from './banner.storage';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { GetBannersQueryDto } from './dto/get-banners-query.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

const uploadOptions = {
  storage: bannerStorage,
  limits: { fileSize: MAX_BANNER_UPLOAD_SIZE },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    try {
      validateBannerFile(file);
      callback(null, true);
    } catch (error) {
      callback(error as Error, false);
    }
  },
};

@Controller('api/banners')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
  PermissionsGuard,
  OrganizationOwnershipGuard,
)
@Roles(Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV)
@OrganizationOwned('banner')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @RequirePermission('BANNER_CREATE')
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async create(
    @Body() dto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('A banner image is required.');
    try {
      return {
        message: 'Banner created successfully.',
        data: await this.bannersService.create(dto, file, user),
      };
    } catch (error) {
      await this.bannersService.cleanupUploadedFile(file);
      throw error;
    }
  }

  @Get()
  @RequirePermission('BANNER_VIEW')
  async findAll(
    @Query() query: GetBannersQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Banners retrieved successfully.',
      data: await this.bannersService.findAll(query, user),
    };
  }

  @Get(':id/image')
  @RequirePermission('BANNER_VIEW')
  async image(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.bannersService.imageStream(id, user);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }

  @Get(':id')
  @RequirePermission('BANNER_VIEW')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Banner retrieved successfully.',
      data: await this.bannersService.findOne(id, user),
    };
  }

  @Put(':id')
  @RequirePermission('BANNER_UPDATE')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBannerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Banner updated successfully.',
      data: await this.bannersService.update(id, dto, user),
    };
  }

  @Put(':id/image')
  @RequirePermission('BANNER_UPDATE')
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async replaceImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('A banner image is required.');
    try {
      return {
        message: 'Banner image replaced successfully.',
        data: await this.bannersService.replaceImage(id, file, user),
      };
    } catch (error) {
      await this.bannersService.cleanupUploadedFile(file);
      throw error;
    }
  }

  @Patch(':id/activate')
  @RequirePermission('BANNER_UPDATE')
  async activate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Banner activated successfully.',
      data: await this.bannersService.setActive(id, true, user),
    };
  }

  @Patch(':id/deactivate')
  @RequirePermission('BANNER_UPDATE')
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Banner deactivated successfully.',
      data: await this.bannersService.setActive(id, false, user),
    };
  }

  @Delete(':id')
  @RequirePermission('BANNER_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Banner deleted successfully.',
      data: await this.bannersService.remove(id, user),
    };
  }

  @Patch(':id/restore')
  @RequirePermission('BANNER_UPDATE')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Banner restored successfully.',
      data: await this.bannersService.restore(id, user),
    };
  }
}
