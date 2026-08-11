import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
import {
  MAX_GALLERY_UPLOAD_COUNT,
  MAX_GALLERY_UPLOAD_SIZE,
} from './gallery.constants';
import { galleryStorage, validateGalleryFile } from './gallery.storage';
import { GalleryService } from './gallery.service';
import { BulkDeleteGalleryImagesDto } from './dto/bulk-delete-gallery-images.dto';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { GetGalleryImagesQueryDto } from './dto/get-gallery-images-query.dto';
import { ReorderGalleryImagesDto } from './dto/reorder-gallery-images.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';

const uploadOptions = {
  storage: galleryStorage,
  limits: {
    fileSize: MAX_GALLERY_UPLOAD_SIZE,
    files: MAX_GALLERY_UPLOAD_COUNT,
  },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, accepted: boolean) => void,
  ) => {
    try {
      validateGalleryFile(file);
      callback(null, true);
    } catch (error) {
      callback(error as Error, false);
    }
  },
};

@Controller('api/gallery')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
  PermissionsGuard,
  OrganizationOwnershipGuard,
)
@Roles(Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV)
@OrganizationOwned('galleryImage')
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}
  @Post()
  @RequirePermission('GALLERY_CREATE')
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async create(
    @Body() dto: CreateGalleryImageDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('A gallery image is required.');
    try {
      return {
        message: 'Gallery image created successfully.',
        data: await this.gallery.create(dto, file, user),
      };
    } catch (error) {
      await this.gallery.cleanupUploadedFiles([file]);
      throw error;
    }
  }
  @Post('bulk-upload')
  @RequirePermission('GALLERY_CREATE')
  @UseInterceptors(
    FilesInterceptor('images', MAX_GALLERY_UPLOAD_COUNT, uploadOptions),
  )
  async bulkUpload(
    @Body() dto: CreateGalleryImageDto,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!files?.length)
      throw new BadRequestException('At least one gallery image is required.');
    try {
      return {
        message: 'Gallery images uploaded successfully.',
        data: await this.gallery.bulkCreate(dto, files, user),
      };
    } catch (error) {
      await this.gallery.cleanupUploadedFiles(files);
      throw error;
    }
  }
  @Get() @RequirePermission('GALLERY_VIEW') async findAll(
    @Query() query: GetGalleryImagesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Gallery images retrieved successfully.',
      data: await this.gallery.findAll(query, user),
    };
  }
  @Get(':id/image') @RequirePermission('GALLERY_VIEW') async image(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.gallery.imageStream(id, user);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }
  @Get(':id') @RequirePermission('GALLERY_VIEW') async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Gallery image retrieved successfully.',
      data: await this.gallery.findOne(id, user),
    };
  }
  @Put('reorder') @RequirePermission('GALLERY_UPDATE') async reorder(
    @Body() dto: ReorderGalleryImagesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.gallery.reorder(dto, user);
    return { message: 'Gallery images reordered successfully.', data: null };
  }
  @Put(':id') @RequirePermission('GALLERY_UPDATE') async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGalleryImageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Gallery image updated successfully.',
      data: await this.gallery.update(id, dto, user),
    };
  }
  @Put(':id/image')
  @RequirePermission('GALLERY_UPDATE')
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async replace(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('A gallery image is required.');
    try {
      return {
        message: 'Gallery image replaced successfully.',
        data: await this.gallery.replaceImage(id, file, user),
      };
    } catch (error) {
      await this.gallery.cleanupUploadedFiles([file]);
      throw error;
    }
  }
  @Delete('bulk') @RequirePermission('GALLERY_DELETE') async bulkDelete(
    @Body() dto: BulkDeleteGalleryImagesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Gallery images deleted successfully.',
      data: await this.gallery.bulkRemove(dto.ids, user),
    };
  }
  @Delete(':id') @RequirePermission('GALLERY_DELETE') async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Gallery image deleted successfully.',
      data: await this.gallery.remove(id, user),
    };
  }
}
