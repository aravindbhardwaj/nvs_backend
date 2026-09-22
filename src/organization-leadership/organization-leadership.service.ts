import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationLeader, Prisma, Role } from '@prisma/client';
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationLeaderDto } from './dto/create-organization-leader.dto';
import { UpdateOrganizationLeaderDto } from './dto/update-organization-leader.dto';
import {
  ORGANIZATION_LEADERSHIP_UPLOADS_ROOT,
  validateOrganizationLeaderImage,
} from './organization-leadership.storage';

@Injectable()
export class OrganizationLeadershipService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateOrganizationLeaderDto,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ) {
    const organization = await this.resolveEligibleOrganization(
      dto.organization_uuid,
      actor,
    );
    await validateOrganizationLeaderImage(file);
    const existingCount = await this.prisma.organizationLeader.count({
      where: { organizationId: organization.id, isDeleted: false },
    });
    const limit = organization.organizationType.code === 'HEADQUARTER' ? 3 : 1;
    if (existingCount >= limit) {
      throw new ConflictException(
        `This organization can have at most ${limit} leadership record${limit === 1 ? '' : 's'}.`,
      );
    }

    try {
      const leader = await this.prisma.organizationLeader.create({
        data: {
          organizationId: organization.id,
          leaderNameEnglish: dto.leaderNameEnglish,
          leaderNameHindi: dto.leaderNameHindi,
          leaderDesignationEnglish: dto.leaderDesignationEnglish,
          leaderDesignationHindi: dto.leaderDesignationHindi,
          messageEnglish: dto.messageEnglish,
          messageHindi: dto.messageHindi,
          ...this.fileData(file),
          isActive: dto.isActive ?? true,
          visibleToAll: dto.visible_to_all ?? false,
          createdById: actor.id,
          updatedById: actor.id,
        },
      });
      return this.toResponse(leader, organization.uuid);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This organization already has a leadership record.',
        );
      }
      throw error;
    }
  }

  async findOne(organizationUuid: string, actor: AuthenticatedUser) {
    const organization = await this.resolveEligibleOrganization(
      organizationUuid,
      actor,
    );
    const leaders = await this.prisma.organizationLeader.findMany({
      where: { organizationId: organization.id, isDeleted: false },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return leaders.map((leader) => this.toResponse(leader, organization.uuid));
  }

  async update(dto: UpdateOrganizationLeaderDto, actor: AuthenticatedUser) {
    const organization = await this.resolveEligibleOrganization(
      dto.organization_uuid,
      actor,
    );
    const existing = await this.findExisting(
      organization.id,
      dto.leadership_uuid,
      organization.organizationType.code,
    );
    const leader = await this.prisma.organizationLeader.update({
      where: { id: existing.id },
      data: {
        leaderNameEnglish: dto.leaderNameEnglish,
        leaderNameHindi: dto.leaderNameHindi,
        leaderDesignationEnglish: dto.leaderDesignationEnglish,
        leaderDesignationHindi: dto.leaderDesignationHindi,
        messageEnglish: dto.messageEnglish,
        messageHindi: dto.messageHindi,
        visibleToAll: dto.visible_to_all,
        updatedById: actor.id,
      },
    });
    return this.toResponse(leader, organization.uuid);
  }

  async replaceImage(
    organizationUuid: string,
    leadershipUuid: string | undefined,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ) {
    const organization = await this.resolveEligibleOrganization(
      organizationUuid,
      actor,
    );
    await validateOrganizationLeaderImage(file);
    const existing = await this.findExisting(
      organization.id,
      leadershipUuid,
      organization.organizationType.code,
    );
    const leader = await this.prisma.organizationLeader.update({
      where: { id: existing.id },
      data: { ...this.fileData(file), updatedById: actor.id },
    });
    await this.deleteStoredFile(existing.imagePath);
    return this.toResponse(leader, organization.uuid);
  }

  async setActive(
    organizationUuid: string,
    leadershipUuid: string | undefined,
    isActive: boolean,
    actor: AuthenticatedUser,
  ) {
    const organization = await this.resolveEligibleOrganization(
      organizationUuid,
      actor,
    );
    const existing = await this.findExisting(
      organization.id,
      leadershipUuid,
      organization.organizationType.code,
    );
    return this.toResponse(
      await this.prisma.organizationLeader.update({
        where: { id: existing.id },
        data: { isActive, updatedById: actor.id },
      }),
      organization.uuid,
    );
  }

  async remove(
    organizationUuid: string,
    leadershipUuid: string | undefined,
    actor: AuthenticatedUser,
  ) {
    const organization = await this.resolveEligibleOrganization(
      organizationUuid,
      actor,
    );
    const existing = await this.findExisting(
      organization.id,
      leadershipUuid,
      organization.organizationType.code,
    );
    return this.toResponse(
      await this.prisma.organizationLeader.update({
        where: { id: existing.id },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: new Date(),
          deletedById: actor.id,
          updatedById: actor.id,
        },
      }),
      organization.uuid,
    );
  }

  async findPublic(organizationUuid: string) {
    const organization = await this.resolvePublicOrganization(organizationUuid);
    const ownerIds =
      organization.organizationType.code === 'JNV' ? [] : [organization.id];
    const headquarters = await this.prisma.organization.findFirst({
      where: {
        isDeleted: false,
        isFunctional: true,
        organizationType: { code: 'HEADQUARTER', isActive: true },
      },
      select: { id: true },
    });
    if (organization.organizationType.code !== 'HEADQUARTER' && headquarters) {
      ownerIds.push(headquarters.id);
    }
    if (
      organization.organizationType.code === 'JNV' &&
      organization.parentOrganizationId
    ) {
      ownerIds.push(organization.parentOrganizationId);
    }
    const leaders = await this.prisma.organizationLeader.findMany({
      where: {
        organizationId: { in: ownerIds },
        isActive: true,
        isDeleted: false,
        OR: [
          { organizationId: organization.id },
          { organizationId: { not: organization.id }, visibleToAll: true },
        ],
      },
      include: {
        organization: {
          select: {
            uuid: true,
            organizationName: true,
            organizationType: { select: { code: true } },
          },
        },
      },
      orderBy: [{ organizationId: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });
    const sourceOrder: Record<string, number> = {
      HEADQUARTER: 0,
      REGIONAL_OFFICE: 1,
      NLI: 1,
      JNV: 2,
    };
    return leaders
      .sort(
        (left, right) =>
          sourceOrder[left.organization.organizationType.code] -
          sourceOrder[right.organization.organizationType.code],
      )
      .map((leader) => this.toPublicResponse(leader));
  }

  async imageStreamByUuid(
    leadershipUuid: string,
    publicOnly: boolean,
    actor?: AuthenticatedUser,
  ) {
    const leader = await this.prisma.organizationLeader.findFirst({
      where: {
        uuid: leadershipUuid,
        isDeleted: false,
        ...(publicOnly ? { isActive: true } : {}),
      },
      include: { organization: { select: { uuid: true } } },
    });
    if (!leader) throw new NotFoundException('Organization leader not found.');
    if (!publicOnly) {
      await this.resolveEligibleOrganization(leader.organization.uuid, actor!);
    }
    return {
      stream: createReadStream(this.absolutePath(leader.imagePath)),
      mimeType: leader.mimeType,
    };
  }

  async imageStream(
    organizationUuid: string,
    publicOnly: boolean,
    actor?: AuthenticatedUser,
  ) {
    const organization = publicOnly
      ? await this.resolvePublicOrganization(organizationUuid)
      : await this.resolveEligibleOrganization(organizationUuid, actor!);
    const leader = await this.prisma.organizationLeader.findFirst({
      where: {
        organizationId: organization.id,
        isDeleted: false,
        ...(publicOnly ? { isActive: true } : {}),
      },
    });
    if (!leader) throw new NotFoundException('Organization leader not found.');
    return {
      stream: createReadStream(this.absolutePath(leader.imagePath)),
      mimeType: leader.mimeType,
    };
  }

  async cleanupUploadedFile(file: Express.Multer.File) {
    await unlink(file.path).catch(() => undefined);
  }

  private async resolveEligibleOrganization(
    uuid: string,
    actor: AuthenticatedUser,
  ) {
    const organization = await this.resolvePublicOrganization(uuid);
    if (organization.organizationType.code === 'JNV') {
      throw new BadRequestException(
        'Organization leadership management is not available for JNV organizations.',
      );
    }
    if (
      actor.role !== Role.SUPER_ADMIN &&
      actor.organizationId !== organization.id
    ) {
      throw new ForbiddenException(
        'You can manage leadership only for your own organization.',
      );
    }
    return organization;
  }

  private async resolvePublicOrganization(uuid: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        uuid,
        isDeleted: false,
        isFunctional: true,
        organizationType: {
          code: { in: ['HEADQUARTER', 'NLI', 'REGIONAL_OFFICE', 'JNV'] },
          isActive: true,
        },
      },
      select: {
        id: true,
        uuid: true,
        parentOrganizationId: true,
        organizationType: { select: { code: true } },
      },
    });
    if (!organization) {
      throw new BadRequestException(
        'organization_uuid must identify an active Headquarters, NLI, Regional Office, or JNV organization.',
      );
    }
    return organization;
  }

  private async findExisting(
    organizationId: number,
    leadershipUuid?: string,
    organizationTypeCode?: string,
  ) {
    if (organizationTypeCode === 'HEADQUARTER' && !leadershipUuid) {
      throw new BadRequestException(
        'leadership_uuid is required when managing a Headquarters leadership record.',
      );
    }
    const leader = await this.prisma.organizationLeader.findFirst({
      where: { organizationId, uuid: leadershipUuid, isDeleted: false },
    });
    if (!leader) throw new NotFoundException('Organization leader not found.');
    return leader;
  }

  private fileData(file: Express.Multer.File) {
    return {
      storedFilename: file.filename,
      imagePath: relative(process.cwd(), file.path).split(sep).join('/'),
      mimeType: file.mimetype,
      extension: extname(file.filename).slice(1).toLowerCase(),
      fileSize: BigInt(file.size),
    };
  }

  private absolutePath(path: string) {
    return resolve(process.cwd(), path);
  }

  private async deleteStoredFile(path: string) {
    const absolute = this.absolutePath(path);
    if (
      absolute.startsWith(resolve(ORGANIZATION_LEADERSHIP_UPLOADS_ROOT) + sep)
    ) {
      await unlink(absolute).catch(() => undefined);
    }
  }

  private toResponse(leader: OrganizationLeader, organizationUuid: string) {
    return {
      id: leader.id,
      uuid: leader.uuid,
      organization_uuid: organizationUuid,
      leaderNameEnglish: leader.leaderNameEnglish,
      leaderNameHindi: leader.leaderNameHindi,
      leaderDesignationEnglish: leader.leaderDesignationEnglish,
      leaderDesignationHindi: leader.leaderDesignationHindi,
      messageEnglish: leader.messageEnglish,
      messageHindi: leader.messageHindi,
      pictureUrl: `/api/organization-leadership/uuid/${leader.uuid}/image`,
      mimeType: leader.mimeType,
      extension: leader.extension,
      fileSize: leader.fileSize.toString(),
      isActive: leader.isActive,
      visible_to_all: leader.visibleToAll,
      createdAt: leader.createdAt,
      updatedAt: leader.updatedAt,
    };
  }

  private toPublicResponse(
    leader: OrganizationLeader & {
      organization: {
        uuid: string;
        organizationName: string;
        organizationType: { code: string };
      };
    },
  ) {
    return {
      uuid: leader.uuid,
      organization_uuid: leader.organization.uuid,
      organization_name: leader.organization.organizationName,
      source_organization_type: leader.organization.organizationType.code,
      leader_name_english: leader.leaderNameEnglish,
      leader_name_hindi: leader.leaderNameHindi,
      leader_designation_english: leader.leaderDesignationEnglish,
      leader_designation_hindi: leader.leaderDesignationHindi,
      message_english: leader.messageEnglish,
      message_hindi: leader.messageHindi,
      visible_to_all: leader.visibleToAll,
      picture_url: `/api/public/organization-leadership/uuid/${leader.uuid}/image`,
    };
  }
}
