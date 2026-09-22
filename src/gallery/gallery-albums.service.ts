import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Gallery, Prisma, Role } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { OrganizationOwnershipService } from '../auth/services/organization-ownership.service';
import { PaginationUtil } from '../common/utils/pagination.util';
import { resolveRelatedId } from '../common/utils/resolve-related-id.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { GalleryResponseDto } from './dto/gallery-response.dto';
import { GetGalleriesQueryDto } from './dto/get-galleries-query.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

type WithCount = Gallery & { _count: { images: number } };

@Injectable()
export class GalleryAlbumsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: OrganizationOwnershipService,
  ) {}

  async create(dto: CreateGalleryDto, actor: AuthenticatedUser) {
    const organizationId =
      (await this.resolveOrganization(
        dto.organizationId,
        dto.organizationUuid,
      )) ?? actor.organizationId;
    this.ownership.assertAccess(organizationId, actor);
    await this.ensureOrganization(organizationId);
    return this.response(
      await this.prisma.gallery.create({
        data: {
          organizationId,
          titleEnglish: dto.titleEnglish,
          titleHindi: dto.titleHindi ?? null,
          descriptionEnglish: dto.descriptionEnglish ?? null,
          descriptionHindi: dto.descriptionHindi ?? null,
          displayOrder: dto.display_order ?? 0,
          isActive: dto.isActive ?? true,
          createdById: actor.id,
          updatedById: actor.id,
        },
        include: { _count: { select: { images: true } } },
      }),
    );
  }

  async findAll(query: GetGalleriesQueryDto, actor: AuthenticatedUser) {
    const requested = await this.resolveOrganization(
      query.organizationId,
      query.organizationUuid,
    );
    if (requested) this.ownership.assertAccess(requested, actor);
    const where: Prisma.GalleryWhereInput = {
      isDeleted: false,
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(actor.role === Role.SUPER_ADMIN
        ? requested
          ? { organizationId: requested }
          : {}
        : { organizationId: actor.organizationId }),
      ...(query.search?.trim()
        ? {
            OR: [
              {
                titleEnglish: {
                  contains: query.search.trim(),
                  mode: 'insensitive',
                },
              },
              {
                titleHindi: {
                  contains: query.search.trim(),
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };
    return this.list(where, query.page, query.limit);
  }

  async findPublic(query: GetGalleriesQueryDto) {
    const organizationId = await this.resolveOrganization(
      query.organizationId,
      query.organizationUuid,
    );
    if (!organizationId)
      throw new BadRequestException(
        'organizationId or organizationUuid is required.',
      );
    const where: Prisma.GalleryWhereInput = {
      isDeleted: false,
      isActive: true,
      organizationId,
    };
    return this.list(where, query.page, query.limit);
  }

  async findOne(uuid: string, actor: AuthenticatedUser) {
    const gallery = await this.active(uuid);
    this.ownership.assertAccess(gallery.organizationId, actor);
    return this.response(gallery);
  }

  async update(uuid: string, dto: UpdateGalleryDto, actor: AuthenticatedUser) {
    const gallery = await this.active(uuid);
    this.ownership.assertAccess(gallery.organizationId, actor);
    return this.response(
      await this.prisma.gallery.update({
        where: { uuid },
        data: {
          titleEnglish: dto.titleEnglish,
          titleHindi: dto.titleHindi,
          descriptionEnglish: dto.descriptionEnglish,
          descriptionHindi: dto.descriptionHindi,
          displayOrder: dto.display_order,
          isActive: dto.isActive,
          updatedById: actor.id,
        },
        include: { _count: { select: { images: true } } },
      }),
    );
  }

  async remove(uuid: string, actor: AuthenticatedUser) {
    const gallery = await this.active(uuid);
    this.ownership.assertAccess(gallery.organizationId, actor);
    if (gallery.isDefault)
      throw new BadRequestException('The default gallery cannot be deleted.');
    if (gallery._count.images)
      throw new BadRequestException(
        'Move or delete all images before deleting this gallery.',
      );
    return this.response(
      await this.prisma.gallery.update({
        where: { uuid },
        data: { isDeleted: true, deletedAt: new Date(), deletedById: actor.id },
        include: { _count: { select: { images: true } } },
      }),
    );
  }

  private async list(
    where: Prisma.GalleryWhereInput,
    page: number,
    limit: number,
  ) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.gallery.findMany({
        where,
        include: { _count: { select: { images: true } } },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.gallery.count({ where }),
    ]);
    return {
      items: items.map((item) => this.response(item)),
      meta: PaginationUtil.buildMeta(page, limit, total),
    };
  }

  private async active(uuid: string): Promise<WithCount> {
    const gallery = await this.prisma.gallery.findFirst({
      where: { uuid, isDeleted: false },
      include: { _count: { select: { images: true } } },
    });
    if (!gallery) throw new NotFoundException('Gallery not found.');
    return gallery;
  }

  private resolveOrganization(id?: number, uuid?: string) {
    return resolveRelatedId(id, uuid, 'Organization', (value) =>
      this.prisma.organization.findUnique({
        where: { uuid: value },
        select: { id: true },
      }),
    );
  }

  private async ensureOrganization(id: number) {
    const organization = await this.prisma.organization.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });
    if (!organization) throw new NotFoundException('Organization not found.');
  }

  private response(gallery: WithCount): GalleryResponseDto {
    return {
      id: gallery.id,
      uuid: gallery.uuid,
      organizationId: gallery.organizationId,
      titleEnglish: gallery.titleEnglish,
      titleHindi: gallery.titleHindi,
      descriptionEnglish: gallery.descriptionEnglish,
      descriptionHindi: gallery.descriptionHindi,
      display_order: gallery.displayOrder,
      isActive: gallery.isActive,
      isDefault: gallery.isDefault,
      imageCount: gallery._count.images,
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
    };
  }
}
