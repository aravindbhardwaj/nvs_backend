import { Injectable, NotFoundException } from '@nestjs/common';
import { Leader, Prisma } from '@prisma/client';
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaderDto } from './dto/create-leader.dto';
import { GetLeadersQueryDto } from './dto/get-leaders-query.dto';
import {
  LeaderResponseDto,
  PublicLeaderResponseDto,
} from './dto/leader-response.dto';
import { ReorderLeadersDto } from './dto/reorder-leaders.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import {
  LEADERSHIP_UPLOADS_ROOT,
  validateLeaderImage,
} from './leadership.storage';

@Injectable()
export class LeadershipService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateLeaderDto,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ) {
    await validateLeaderImage(file);
    const leader = await this.prisma.leader.create({
      data: {
        leaderNameEnglish: dto.leaderNameEnglish,
        leaderNameHindi: dto.leaderNameHindi,
        leaderDesignationEnglish: dto.leaderDesignationEnglish,
        leaderDesignationHindi: dto.leaderDesignationHindi,
        storedFilename: file.filename,
        imagePath: this.relativePath(file.path),
        mimeType: file.mimetype,
        extension: extname(file.filename).slice(1).toLowerCase(),
        fileSize: BigInt(file.size),
        display_order: dto.display_order ?? 0,
        isActive: dto.isActive ?? true,
        createdById: actor.id,
        updatedById: actor.id,
      },
    });
    return this.toResponse(leader);
  }

  async findAll(query: GetLeadersQueryDto) {
    const where: Prisma.LeaderWhereInput = {
      isDeleted: query.isDeleted ?? false,
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.search
        ? {
            OR: [
              {
                leaderNameEnglish: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                leaderNameHindi: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                leaderDesignationEnglish: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                leaderDesignationHindi: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.leader.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sort]: query.order },
      }),
      this.prisma.leader.count({ where }),
    ]);
    return {
      items: items.map((item) => this.toResponse(item)),
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
      },
    };
  }

  async findOne(id: number) {
    return this.toResponse(await this.findExisting(id));
  }

  async update(id: number, dto: UpdateLeaderDto, actor: AuthenticatedUser) {
    await this.findExisting(id);
    const leader = await this.prisma.leader.update({
      where: { id },
      data: { ...dto, updatedById: actor.id },
    });
    return this.toResponse(leader);
  }

  async replaceImage(
    id: number,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ) {
    await validateLeaderImage(file);
    const existing = await this.findExisting(id);
    const leader = await this.prisma.leader.update({
      where: { id },
      data: {
        storedFilename: file.filename,
        imagePath: this.relativePath(file.path),
        mimeType: file.mimetype,
        extension: extname(file.filename).slice(1).toLowerCase(),
        fileSize: BigInt(file.size),
        updatedById: actor.id,
      },
    });
    await this.deleteStoredFile(existing.imagePath);
    return this.toResponse(leader);
  }

  async setActive(id: number, isActive: boolean, actor: AuthenticatedUser) {
    await this.findExisting(id);
    return this.toResponse(
      await this.prisma.leader.update({
        where: { id },
        data: { isActive, updatedById: actor.id },
      }),
    );
  }

  async reorder(dto: ReorderLeadersDto, actor: AuthenticatedUser) {
    const ids = dto.items.map((item) => item.id);
    const count = await this.prisma.leader.count({
      where: { id: { in: ids }, isDeleted: false },
    });
    if (count !== new Set(ids).size)
      throw new NotFoundException('One or more leaders were not found.');
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.leader.update({
          where: { id: item.id },
          data: { display_order: item.display_order, updatedById: actor.id },
        }),
      ),
    );
  }

  async remove(id: number, actor: AuthenticatedUser) {
    await this.findExisting(id);
    return this.toResponse(
      await this.prisma.leader.update({
        where: { id },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: new Date(),
          deletedById: actor.id,
          updatedById: actor.id,
        },
      }),
    );
  }

  async findPublic() {
    const leaders = await this.prisma.leader.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: [{ display_order: 'asc' }, { id: 'asc' }],
    });
    return leaders.map((leader) => this.toPublicResponse(leader));
  }

  async findPublicOne(id: number) {
    const leader = await this.prisma.leader.findFirst({
      where: { id, isActive: true, isDeleted: false },
    });
    if (!leader) throw new NotFoundException('Leader not found.');
    return this.toPublicResponse(leader);
  }

  async imageStream(id: number, publicOnly = false) {
    const leader = await this.prisma.leader.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(publicOnly ? { isActive: true } : {}),
      },
    });
    if (!leader) throw new NotFoundException('Leader not found.');
    return {
      stream: createReadStream(this.absolutePath(leader.imagePath)),
      mimeType: leader.mimeType,
    };
  }

  async cleanupUploadedFile(file: Express.Multer.File) {
    await unlink(file.path).catch(() => undefined);
  }

  private async findExisting(id: number) {
    const leader = await this.prisma.leader.findFirst({
      where: { id, isDeleted: false },
    });
    if (!leader) throw new NotFoundException('Leader not found.');
    return leader;
  }
  private relativePath(path: string) {
    return relative(process.cwd(), path).split(sep).join('/');
  }
  private absolutePath(path: string) {
    return resolve(process.cwd(), path);
  }
  private async deleteStoredFile(path: string) {
    const absolute = this.absolutePath(path);
    if (absolute.startsWith(resolve(LEADERSHIP_UPLOADS_ROOT) + sep))
      await unlink(absolute).catch(() => undefined);
  }
  private toResponse(leader: Leader): LeaderResponseDto {
    return {
      id: leader.id,
      leaderNameEnglish: leader.leaderNameEnglish,
      leaderNameHindi: leader.leaderNameHindi,
      leaderDesignationEnglish: leader.leaderDesignationEnglish,
      leaderDesignationHindi: leader.leaderDesignationHindi,
      pictureUrl: `/api/leadership/${leader.id}/image`,
      mimeType: leader.mimeType,
      extension: leader.extension,
      fileSize: leader.fileSize.toString(),
      display_order: leader.display_order,
      isActive: leader.isActive,
      createdAt: leader.createdAt,
      updatedAt: leader.updatedAt,
      isDeleted: leader.isDeleted,
    };
  }
  private toPublicResponse(leader: Leader): PublicLeaderResponseDto {
    return {
      id: leader.id,
      leader_name_english: leader.leaderNameEnglish,
      leader_name_hindi: leader.leaderNameHindi,
      leader_designation_english: leader.leaderDesignationEnglish,
      leader_designation_hindi: leader.leaderDesignationHindi,
      picture_url: `/api/public/leadership/${leader.id}/image`,
      display_order: leader.display_order,
    };
  }
}
