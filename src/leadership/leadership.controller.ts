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
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateLeaderDto } from './dto/create-leader.dto';
import { GetLeadersQueryDto } from './dto/get-leaders-query.dto';
import { ReorderLeadersDto } from './dto/reorder-leaders.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import { MAX_LEADER_IMAGE_SIZE } from './leadership.constants';
import { LeadershipService } from './leadership.service';
import { leadershipStorage, validateLeaderFile } from './leadership.storage';

const uploadOptions = {
  storage: leadershipStorage,
  limits: { fileSize: MAX_LEADER_IMAGE_SIZE },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, accepted: boolean) => void,
  ) => {
    try {
      validateLeaderFile(file);
      callback(null, true);
    } catch (error) {
      callback(error as Error, false);
    }
  },
};

@Controller('api/leadership')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV)
export class LeadershipController {
  constructor(private readonly leadership: LeadershipService) {}

  @Post()
  @RequirePermission('LEADERSHIP_CREATE')
  @UseInterceptors(FileInterceptor('picture', uploadOptions))
  async create(
    @Body() dto: CreateLeaderDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('A leader picture is required.');
    try {
      return {
        message: 'Leader created successfully.',
        data: await this.leadership.create(dto, file, user),
      };
    } catch (error) {
      await this.leadership.cleanupUploadedFile(file);
      throw error;
    }
  }

  @Get()
  @RequirePermission('LEADERSHIP_VIEW')
  async findAll(@Query() query: GetLeadersQueryDto) {
    return {
      message: 'Leaders retrieved successfully.',
      data: await this.leadership.findAll(query),
    };
  }

  @Get(':id/image')
  @RequirePermission('LEADERSHIP_VIEW')
  async image(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.leadership.imageStream(id);
    response.setHeader('Content-Type', image.mimeType);
    image.stream.on('error', () => response.destroy());
    image.stream.pipe(response);
  }

  @Get(':id')
  @RequirePermission('LEADERSHIP_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Leader retrieved successfully.',
      data: await this.leadership.findOne(id),
    };
  }

  @Put('reorder')
  @RequirePermission('LEADERSHIP_UPDATE')
  async reorder(
    @Body() dto: ReorderLeadersDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.leadership.reorder(dto, user);
    return { message: 'Leaders reordered successfully.', data: null };
  }

  @Put(':id')
  @RequirePermission('LEADERSHIP_UPDATE')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Leader updated successfully.',
      data: await this.leadership.update(id, dto, user),
    };
  }

  @Put(':id/image')
  @RequirePermission('LEADERSHIP_UPDATE')
  @UseInterceptors(FileInterceptor('picture', uploadOptions))
  async replaceImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('A leader picture is required.');
    try {
      return {
        message: 'Leader picture replaced successfully.',
        data: await this.leadership.replaceImage(id, file, user),
      };
    } catch (error) {
      await this.leadership.cleanupUploadedFile(file);
      throw error;
    }
  }

  @Patch(':id/activate')
  @RequirePermission('LEADERSHIP_UPDATE')
  async activate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Leader activated successfully.',
      data: await this.leadership.setActive(id, true, user),
    };
  }

  @Patch(':id/deactivate')
  @RequirePermission('LEADERSHIP_UPDATE')
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Leader deactivated successfully.',
      data: await this.leadership.setActive(id, false, user),
    };
  }

  @Delete(':id')
  @RequirePermission('LEADERSHIP_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Leader deleted successfully.',
      data: await this.leadership.remove(id, user),
    };
  }
}
