import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
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
import { CreateOrganizationLeaderDto } from './dto/create-organization-leader.dto';
import { OrganizationReferenceDto } from './dto/organization-reference.dto';
import { UpdateOrganizationLeaderDto } from './dto/update-organization-leader.dto';
import { MAX_ORGANIZATION_LEADER_IMAGE_SIZE } from './organization-leadership.constants';
import { OrganizationLeadershipService } from './organization-leadership.service';
import {
  organizationLeadershipStorage,
  validateOrganizationLeaderFile,
} from './organization-leadership.storage';

const uploadOptions = {
  storage: organizationLeadershipStorage,
  limits: { fileSize: MAX_ORGANIZATION_LEADER_IMAGE_SIZE },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, accepted: boolean) => void,
  ) => {
    try {
      validateOrganizationLeaderFile(file);
      callback(null, true);
    } catch (error) {
      callback(error as Error, false);
    }
  },
};

@Controller('api/organization-leadership')
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL)
export class OrganizationLeadershipController {
  constructor(private readonly leadership: OrganizationLeadershipService) {}

  @Post()
  @UseInterceptors(FileInterceptor('picture', uploadOptions))
  async create(
    @Body() dto: CreateOrganizationLeaderDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('A leader picture is required.');
    try {
      return {
        message: 'Organization leader created successfully.',
        data: await this.leadership.create(dto, file, user),
      };
    } catch (error) {
      await this.leadership.cleanupUploadedFile(file);
      throw error;
    }
  }

  @Post('update')
  @HttpCode(200)
  async update(
    @Body() dto: UpdateOrganizationLeaderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization leader updated successfully.',
      data: await this.leadership.update(dto, user),
    };
  }

  @Post('image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('picture', uploadOptions))
  async replaceImage(
    @Body() dto: OrganizationReferenceDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('A leader picture is required.');
    try {
      return {
        message: 'Organization leader picture replaced successfully.',
        data: await this.leadership.replaceImage(
          dto.organization_uuid,
          dto.leadership_uuid,
          file,
          user,
        ),
      };
    } catch (error) {
      await this.leadership.cleanupUploadedFile(file);
      throw error;
    }
  }

  @Post('activate')
  @HttpCode(200)
  async activate(
    @Body() dto: OrganizationReferenceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization leader activated successfully.',
      data: await this.leadership.setActive(
        dto.organization_uuid,
        dto.leadership_uuid,
        true,
        user,
      ),
    };
  }

  @Post('deactivate')
  @HttpCode(200)
  async deactivate(
    @Body() dto: OrganizationReferenceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization leader deactivated successfully.',
      data: await this.leadership.setActive(
        dto.organization_uuid,
        dto.leadership_uuid,
        false,
        user,
      ),
    };
  }

  @Post('delete')
  @HttpCode(200)
  async remove(
    @Body() dto: OrganizationReferenceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization leader deleted successfully.',
      data: await this.leadership.remove(
        dto.organization_uuid,
        dto.leadership_uuid,
        user,
      ),
    };
  }

  @Get(':organizationUuid/image')
  async image(
    @Param('organizationUuid', ParseUUIDPipe) organizationUuid: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.leadership.imageStream(
      organizationUuid,
      false,
      user,
    );
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }

  @Get('uuid/:leadershipUuid/image')
  async imageByUuid(
    @Param('leadershipUuid', ParseUUIDPipe) leadershipUuid: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.leadership.imageStreamByUuid(
      leadershipUuid,
      false,
      user,
    );
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }

  @Get(':organizationUuid')
  async findOne(
    @Param('organizationUuid', ParseUUIDPipe) organizationUuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Organization leader retrieved successfully.',
      data: await this.leadership.findOne(organizationUuid, user),
    };
  }
}
