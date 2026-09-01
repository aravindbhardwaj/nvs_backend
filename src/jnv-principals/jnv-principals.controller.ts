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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateJnvPrincipalDto } from './dto/create-jnv-principal.dto';
import { UpdateJnvPrincipalDto } from './dto/update-jnv-principal.dto';
import { MAX_JNV_PRINCIPAL_IMAGE_SIZE } from './jnv-principals.constants';
import { JnvPrincipalsService } from './jnv-principals.service';
import {
  jnvPrincipalStorage,
  validateJnvPrincipalFile,
} from './jnv-principals.storage';

const uploadOptions = {
  storage: jnvPrincipalStorage,
  limits: { fileSize: MAX_JNV_PRINCIPAL_IMAGE_SIZE },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, accepted: boolean) => void,
  ) => {
    try {
      validateJnvPrincipalFile(file);
      callback(null, true);
    } catch (error) {
      callback(error as Error, false);
    }
  },
};

@Controller('api/jnvs/:organizationId/principals')
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class JnvPrincipalsController {
  constructor(private readonly principals: JnvPrincipalsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('picture', uploadOptions))
  async create(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body() dto: CreateJnvPrincipalDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      return {
        message: 'JNV principal created successfully.',
        data: await this.principals.create(organizationId, dto, file, user),
      };
    } catch (error) {
      if (file) await this.principals.cleanupUploadedFile(file);
      throw error;
    }
  }

  @Get()
  async findAll(@Param('organizationId', ParseIntPipe) organizationId: number) {
    return {
      message: 'JNV principals retrieved successfully.',
      data: await this.principals.findAll(organizationId),
    };
  }

  @Get(':id/image')
  async image(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.principals.imageStream(organizationId, id);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }

  @Get(':id')
  async findOne(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return {
      message: 'JNV principal retrieved successfully.',
      data: await this.principals.findOne(organizationId, id),
    };
  }

  @Patch(':id')
  async update(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJnvPrincipalDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'JNV principal updated successfully.',
      data: await this.principals.update(organizationId, id, dto, user),
    };
  }

  @Put(':id/image')
  @UseInterceptors(FileInterceptor('picture', uploadOptions))
  async replaceImage(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file)
      throw new BadRequestException('A principal picture is required.');
    try {
      return {
        message: 'Principal picture updated successfully.',
        data: await this.principals.replaceImage(
          organizationId,
          id,
          file,
          user,
        ),
      };
    } catch (error) {
      await this.principals.cleanupUploadedFile(file);
      throw error;
    }
  }

  @Delete(':id')
  async remove(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'JNV principal deleted successfully.',
      data: await this.principals.remove(organizationId, id, user),
    };
  }
}
