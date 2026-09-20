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
import { OrganizationIdentifierPipe } from './organization-identifier.pipe';
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

  @Get('uuid/:uuid/image')
  async imageByUuid(
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Res() response: Response,
  ): Promise<void> {
    const id = await this.principals.resolveUuid(uuid);
    return this.image(organizationId, id, response);
  }

  @Get('uuid/:uuid')
  async findOneByUuid(
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    const id = await this.principals.resolveUuid(uuid);
    return this.findOne(organizationId, id);
  }

  @Post('uuid/:uuid/update')
  @HttpCode(200)
  async updateByUuid(
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateJnvPrincipalDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.principals.resolveUuid(uuid);
    return this.update(organizationId, id, dto, user);
  }

  @Post('uuid/:uuid/image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('picture', uploadOptions))
  async replaceImageByUuid(
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file)
      throw new BadRequestException('A principal picture is required.');
    try {
      const id = await this.principals.resolveUuid(uuid);
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

  @Post('uuid/:uuid/delete')
  @HttpCode(200)
  async removeByUuid(
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = await this.principals.resolveUuid(uuid);
    return this.remove(organizationId, id, user);
  }

  @Post()
  @UseInterceptors(FileInterceptor('picture', uploadOptions))
  async create(
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
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
  async findAll(
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
  ) {
    return {
      message: 'JNV principals retrieved successfully.',
      data: await this.principals.findAll(organizationId),
    };
  }

  @Get(':id/image')
  async image(
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
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
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return {
      message: 'JNV principal retrieved successfully.',
      data: await this.principals.findOne(organizationId, id),
    };
  }

  @Post(':id/update')
  @HttpCode(200)
  async update(
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJnvPrincipalDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'JNV principal updated successfully.',
      data: await this.principals.update(organizationId, id, dto, user),
    };
  }

  @Post(':id/image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('picture', uploadOptions))
  async replaceImage(
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
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

  @Post(':id/delete')
  @HttpCode(200)
  async remove(
    @Param('organizationId', OrganizationIdentifierPipe) organizationId: number,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'JNV principal deleted successfully.',
      data: await this.principals.remove(organizationId, id, user),
    };
  }
}
