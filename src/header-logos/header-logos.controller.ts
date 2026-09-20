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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateHeaderLogoDto, UpdateHeaderLogoDto } from './header-logo.dto';
import {
  headerLogoStorage,
  MAX_HEADER_LOGO_SIZE,
  validateHeaderLogoFile,
} from './header-logo.storage';
import { HeaderLogosService } from './header-logos.service';

const uploadOptions = {
  storage: headerLogoStorage,
  limits: { fileSize: MAX_HEADER_LOGO_SIZE },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, accept: boolean) => void,
  ) => {
    try {
      validateHeaderLogoFile(file);
      callback(null, true);
    } catch (error) {
      callback(error as Error, false);
    }
  },
};

@Controller('api/header-logos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.HEADQUARTER)
export class HeaderLogosController {
  constructor(private readonly service: HeaderLogosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async create(
    @Body() dto: CreateHeaderLogoDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file)
      throw new BadRequestException('A header logo image is required.');
    try {
      return {
        message: 'Header logo uploaded successfully.',
        data: await this.service.create(dto, file, user),
      };
    } catch (error) {
      await this.service.cleanup(file);
      throw error;
    }
  }

  @Get()
  async findAll() {
    return {
      message: 'Header logos retrieved successfully.',
      data: await this.service.findAll(),
    };
  }

  @Get('uuid/:uuid/image')
  async imageByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Res() response: Response,
  ) {
    return this.image(await this.service.resolveUuid(uuid), response);
  }

  @Post('uuid/:uuid/update')
  @HttpCode(200)
  async updateByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateHeaderLogoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.update(await this.service.resolveUuid(uuid), dto, user);
  }

  @Post('uuid/:uuid/image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async replaceImageByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file)
      throw new BadRequestException('A header logo image is required.');
    try {
      const id = await this.service.resolveUuid(uuid);
      return {
        message: 'Header logo image replaced successfully.',
        data: await this.service.replaceImage(id, file, user),
      };
    } catch (error) {
      await this.service.cleanup(file);
      throw error;
    }
  }

  @Post('uuid/:uuid/activate')
  @HttpCode(200)
  async activateByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.update(
      await this.service.resolveUuid(uuid),
      { isActive: true },
      user,
    );
  }

  @Post('uuid/:uuid/deactivate')
  @HttpCode(200)
  async deactivateByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.update(
      await this.service.resolveUuid(uuid),
      { isActive: false },
      user,
    );
  }

  @Post('uuid/:uuid/delete')
  @HttpCode(200)
  async removeByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.remove(await this.service.resolveUuid(uuid), user);
  }

  @Get(':id/image')
  async image(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ) {
    const image = await this.service.imageStream(id);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.pipe(response);
  }

  @Post(':id/update')
  @HttpCode(200)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHeaderLogoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Header logo updated successfully.',
      data: await this.service.update(id, dto, user),
    };
  }

  @Post(':id/image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async replaceImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file)
      throw new BadRequestException('A header logo image is required.');
    try {
      return {
        message: 'Header logo image replaced successfully.',
        data: await this.service.replaceImage(id, file, user),
      };
    } catch (error) {
      await this.service.cleanup(file);
      throw error;
    }
  }

  @Post(':id/activate')
  @HttpCode(200)
  activate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.update(id, { isActive: true }, user);
  }

  @Post(':id/deactivate')
  @HttpCode(200)
  deactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.update(id, { isActive: false }, user);
  }

  @Post(':id/delete')
  @HttpCode(200)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Header logo deleted successfully.',
      data: await this.service.remove(id, user),
    };
  }
}
