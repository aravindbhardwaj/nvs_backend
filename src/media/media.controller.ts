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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
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
import { GetMediaQueryDto } from './dto/get-media-query.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MAX_UPLOAD_SIZE } from './media.constants';
import { MediaService } from './media.service';
import { mediaStorage, validateMediaFile } from './media.storage';

const uploadOptions = {
  storage: mediaStorage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    try {
      validateMediaFile(file);
      callback(null, true);
    } catch (error) {
      callback(error as Error, false);
    }
  },
};

@Controller('api/media')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
  PermissionsGuard,
  OrganizationOwnershipGuard,
)
@Roles(Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV)
@OrganizationOwned('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @RequirePermission('MEDIA_UPLOAD')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'hindiFile', maxCount: 1 },
      ],
      uploadOptions,
    ),
  )
  async upload(
    @Body() dto: UploadMediaDto,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; hindiFile?: Express.Multer.File[] },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const file = files?.file?.[0];
    const hindiFile = files?.hindiFile?.[0];
    if (!file) throw new BadRequestException('A document file is required.');
    try {
      return {
        message: 'Document uploaded successfully.',
        data: await this.mediaService.upload(dto, file, hindiFile, user),
      };
    } catch (error) {
      await this.mediaService.cleanupUploadedFiles([file, hindiFile]);
      throw error;
    }
  }

  @Get()
  @RequirePermission('MEDIA_VIEW')
  async findAll(
    @Query() query: GetMediaQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Media retrieved successfully.',
      data: await this.mediaService.findAll(query, user),
    };
  }

  @Get(':id/download')
  @RequirePermission('MEDIA_VIEW')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Res() response: Response,
  ): Promise<void> {
    const document = await this.mediaService.download(id, user);
    response.setHeader('Content-Type', document.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(document.filename)}`,
    );
    document.stream.on('error', () => response.destroy());
    document.stream.pipe(response);
  }

  @Get(':id/download/hindi')
  @RequirePermission('MEDIA_VIEW')
  async downloadHindi(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Res() response: Response,
  ): Promise<void> {
    const document = await this.mediaService.downloadHindi(id, user);
    response.setHeader('Content-Type', document.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(document.filename)}`,
    );
    document.stream.on('error', () => response.destroy());
    document.stream.pipe(response);
  }

  @Get(':id')
  @RequirePermission('MEDIA_VIEW')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Media retrieved successfully.',
      data: await this.mediaService.findOne(id, user),
    };
  }

  @Put(':id/file')
  @RequirePermission('MEDIA_UPLOAD')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async replaceFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('A document file is required.');
    try {
      return {
        message: 'Document replaced successfully.',
        data: await this.mediaService.replaceFile(id, file, user),
      };
    } catch (error) {
      await this.mediaService.cleanupUploadedFile(file);
      throw error;
    }
  }

  @Put(':id')
  @RequirePermission('MEDIA_UPLOAD')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMediaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Media metadata updated successfully.',
      data: await this.mediaService.update(id, dto, user),
    };
  }

  @Delete(':id')
  @RequirePermission('MEDIA_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Media deleted successfully.',
      data: await this.mediaService.remove(id, user),
    };
  }

  @Patch(':id/restore')
  @RequirePermission('MEDIA_UPLOAD')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Media restored successfully.',
      data: await this.mediaService.restore(id, user),
    };
  }
}
