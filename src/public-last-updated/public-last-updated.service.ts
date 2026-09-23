import { Injectable, NotFoundException } from '@nestjs/common';
import { PageStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toCalendarDate } from '../common/utils/calendar-date.util';

type OrganizationScope = {
  id: number;
  parentOrganizationId: number | null;
  organizationType: { code: string };
};

@Injectable()
export class PublicLastUpdatedService {
  constructor(private readonly prisma: PrismaService) {}

  async getLastUpdated(organizationUuid: string): Promise<{
    organizationUuid: string;
    lastUpdatedAt: string | null;
  }> {
    const organization = await this.prisma.organization.findFirst({
      where: { uuid: organizationUuid, isDeleted: false },
      select: {
        id: true,
        parentOrganizationId: true,
        organizationType: { select: { code: true } },
      },
    });
    if (!organization) throw new NotFoundException('Organization not found.');

    const now = new Date();
    const today = toCalendarDate(now.toISOString().slice(0, 10));
    const pageWhere: Prisma.PageWhereInput = {
      organizationId: organization.id,
      isDeleted: false,
      status: PageStatus.PUBLISHED,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: today } }] },
        { OR: [{ endDate: null }, { endDate: { gte: today } }] },
      ],
    };
    const mediaWhere: Prisma.MediaWhereInput = {
      isDeleted: false,
      isActive: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: today } }] },
        { OR: [{ endDate: null }, { endDate: { gte: today } }] },
        { OR: this.mediaVisibility(organization) },
      ],
    };
    const bannerWhere: Prisma.BannerWhereInput = {
      isDeleted: false,
      isActive: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        { OR: this.bannerVisibility(organization) },
      ],
    };
    const imageWhere: Prisma.GalleryImageWhereInput = {
      organizationId: organization.id,
      isDeleted: false,
      isActive: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    };
    const galleryWhere: Prisma.GalleryWhereInput = {
      organizationId: organization.id,
      isDeleted: false,
      isActive: true,
    };

    const [pages, media, banners, images, galleries] = await Promise.all([
      this.prisma.page.aggregate({
        where: pageWhere,
        _max: { updatedAt: true, publishedAt: true, startDate: true },
      }),
      this.prisma.media.aggregate({
        where: mediaWhere,
        _max: { updatedAt: true, uploadedAt: true, startDate: true },
      }),
      this.prisma.banner.aggregate({
        where: bannerWhere,
        _max: { updatedAt: true, startDate: true },
      }),
      this.prisma.galleryImage.aggregate({
        where: imageWhere,
        _max: { updatedAt: true, startDate: true },
      }),
      this.prisma.gallery.aggregate({
        where: galleryWhere,
        _max: { updatedAt: true },
      }),
    ]);

    const dates = [
      ...Object.values(pages._max),
      ...Object.values(media._max),
      ...Object.values(banners._max),
      ...Object.values(images._max),
      ...Object.values(galleries._max),
    ].filter((date): date is Date => date instanceof Date && date <= now);
    const lastUpdatedAt = dates.length
      ? new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(new Date(Math.max(...dates.map((date) => date.getTime()))))
      : null;

    return { organizationUuid, lastUpdatedAt };
  }

  private mediaVisibility(
    organization: OrganizationScope,
  ): Prisma.MediaWhereInput[] {
    const visible: Prisma.MediaWhereInput[] = [
      { organizationId: organization.id },
      {
        visibleToAll: true,
        organization: { organizationType: { code: 'HEADQUARTER' } },
      },
    ];
    if (organization.organizationType.code === 'REGIONAL_OFFICE') {
      visible.push(this.selectiveHeadquartersMedia(organization.id));
    }
    if (
      organization.organizationType.code === 'JNV' &&
      organization.parentOrganizationId
    ) {
      visible.push({
        visibleToAll: true,
        organizationId: organization.parentOrganizationId,
        organization: { organizationType: { code: 'REGIONAL_OFFICE' } },
      });
      visible.push(
        this.selectiveHeadquartersMedia(
          organization.parentOrganizationId,
          organization.id,
        ),
      );
    }
    return visible;
  }

  private selectiveHeadquartersMedia(
    roId: number,
    jnvId?: number,
  ): Prisma.MediaWhereInput {
    const exactId = (
      field: 'roIds' | 'jnvIds',
      id: number,
    ): Prisma.MediaWhereInput => {
      const token = String(id);
      return {
        OR: [
          { [field]: token },
          { [field]: { startsWith: `${token},` } },
          { [field]: { endsWith: `,${token}` } },
          { [field]: { contains: `,${token},` } },
        ],
      };
    };
    return {
      organization: { organizationType: { code: 'HEADQUARTER' } },
      AND: [
        { OR: [{ visibleToAll: false }, { visibleToAll: null }] },
        exactId('roIds', roId),
        ...(jnvId === undefined ? [] : [exactId('jnvIds', jnvId)]),
      ],
    };
  }

  private bannerVisibility(
    organization: OrganizationScope,
  ): Prisma.BannerWhereInput[] {
    const visible: Prisma.BannerWhereInput[] = [
      { organizationId: organization.id },
      {
        visibleToAll: true,
        organization: { organizationType: { code: 'HEADQUARTER' } },
      },
    ];
    if (
      organization.organizationType.code === 'JNV' &&
      organization.parentOrganizationId
    ) {
      visible.push({
        visibleToAll: true,
        organizationId: organization.parentOrganizationId,
        organization: { organizationType: { code: 'REGIONAL_OFFICE' } },
      });
    }
    return visible;
  }
}
