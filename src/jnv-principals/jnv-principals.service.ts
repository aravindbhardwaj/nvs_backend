import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JnvPrincipal } from '@prisma/client';
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJnvPrincipalDto } from './dto/create-jnv-principal.dto';
import { UpdateJnvPrincipalDto } from './dto/update-jnv-principal.dto';
import {
  JNV_PRINCIPAL_UPLOADS_ROOT,
  validateJnvPrincipalImage,
} from './jnv-principals.storage';

@Injectable()
export class JnvPrincipalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organizationId: number,
    dto: CreateJnvPrincipalDto,
    file: Express.Multer.File | undefined,
    actor: AuthenticatedUser,
  ) {
    await this.ensureJnv(organizationId);
    if (file) await validateJnvPrincipalImage(file);
    this.ensureTenure(dto.joinedAt, dto.relievedAt);
    const joinedAt = dto.joinedAt ?? new Date();
    const principal = await this.prisma.$transaction(async (transaction) => {
      if (!dto.relievedAt) {
        const current = await transaction.jnvPrincipal.findFirst({
          where: { organizationId, relievedAt: null, isDeleted: false },
        });
        if (current && current.joinedAt > joinedAt) {
          throw new BadRequestException(
            'joinedAt cannot be earlier than the current principal joinedAt.',
          );
        }
        await transaction.jnvPrincipal.updateMany({
          where: { organizationId, relievedAt: null, isDeleted: false },
          data: { relievedAt: joinedAt, updatedById: actor.id },
        });
      }
      return transaction.jnvPrincipal.create({
        data: {
          organizationId,
          principalNameEnglish: dto.principalNameEnglish,
          principalNameHindi: dto.principalNameHindi,
          principalDesignationEnglish: dto.principalDesignationEnglish,
          principalDesignationHindi: dto.principalDesignationHindi,
          email: dto.email,
          mobile: dto.mobile,
          messageEnglish: dto.messageEnglish,
          messageHindi: dto.messageHindi,
          joinedAt,
          relievedAt: dto.relievedAt,
          displayOrder: dto.displayOrder ?? 0,
          isActive: dto.isActive ?? true,
          ...(file ? this.fileData(file) : {}),
          createdById: actor.id,
          updatedById: actor.id,
        },
      });
    });
    return this.toResponse(principal);
  }

  async findAll(organizationId: number) {
    await this.ensureJnv(organizationId);
    const principals = await this.prisma.jnvPrincipal.findMany({
      where: { organizationId, isDeleted: false },
      orderBy: [{ joinedAt: 'desc' }, { displayOrder: 'asc' }, { id: 'desc' }],
    });
    return principals.map((principal) => this.toResponse(principal));
  }

  async findOne(organizationId: number, id: number) {
    return this.toResponse(await this.findExisting(organizationId, id));
  }

  async update(
    organizationId: number,
    id: number,
    dto: UpdateJnvPrincipalDto,
    actor: AuthenticatedUser,
  ) {
    const existing = await this.findExisting(organizationId, id);
    this.ensureTenure(
      dto.joinedAt ?? existing.joinedAt,
      dto.relievedAt ?? existing.relievedAt,
    );
    return this.toResponse(
      await this.prisma.jnvPrincipal.update({
        where: { id },
        data: { ...dto, updatedById: actor.id },
      }),
    );
  }

  async replaceImage(
    organizationId: number,
    id: number,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ) {
    await validateJnvPrincipalImage(file);
    const existing = await this.findExisting(organizationId, id);
    const principal = await this.prisma.jnvPrincipal.update({
      where: { id },
      data: { ...this.fileData(file), updatedById: actor.id },
    });
    if (existing.imagePath) await this.deleteStoredFile(existing.imagePath);
    return this.toResponse(principal);
  }

  async remove(organizationId: number, id: number, actor: AuthenticatedUser) {
    await this.findExisting(organizationId, id);
    return this.toResponse(
      await this.prisma.jnvPrincipal.update({
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

  async findPublicCurrent(organizationId: number) {
    await this.ensureJnv(organizationId);
    const principal = await this.prisma.jnvPrincipal.findFirst({
      where: {
        organizationId,
        relievedAt: null,
        isActive: true,
        isDeleted: false,
      },
    });
    if (!principal) throw new NotFoundException('Current principal not found.');
    return this.toPublicResponse(principal);
  }

  async findPublicHistory(organizationId: number) {
    await this.ensureJnv(organizationId);
    const principals = await this.prisma.jnvPrincipal.findMany({
      where: { organizationId, isActive: true, isDeleted: false },
      orderBy: [{ joinedAt: 'desc' }, { displayOrder: 'asc' }, { id: 'desc' }],
    });
    return principals.map((principal) => this.toPublicResponse(principal));
  }

  async imageStream(organizationId: number, id: number, publicOnly = false) {
    const principal = await this.prisma.jnvPrincipal.findFirst({
      where: {
        id,
        organizationId,
        isDeleted: false,
        ...(publicOnly ? { isActive: true } : {}),
      },
    });
    if (!principal?.imagePath || !principal.mimeType)
      throw new NotFoundException('Principal picture not found.');
    return {
      stream: createReadStream(this.absolutePath(principal.imagePath)),
      mimeType: principal.mimeType,
    };
  }

  async cleanupUploadedFile(file: Express.Multer.File) {
    await unlink(file.path).catch(() => undefined);
  }

  private async ensureJnv(organizationId: number) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        isDeleted: false,
        isFunctional: true,
        organizationType: { code: 'JNV', isActive: true },
      },
      select: { id: true },
    });
    if (!organization)
      throw new BadRequestException(
        'organizationId must identify an active JNV organization.',
      );
  }

  private async findExisting(organizationId: number, id: number) {
    const principal = await this.prisma.jnvPrincipal.findFirst({
      where: { id, organizationId, isDeleted: false },
    });
    if (!principal) throw new NotFoundException('JNV principal not found.');
    return principal;
  }

  private ensureTenure(joinedAt?: Date, relievedAt?: Date | null) {
    if (joinedAt && relievedAt && relievedAt < joinedAt)
      throw new BadRequestException('relievedAt cannot be before joinedAt.');
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
    if (absolute.startsWith(resolve(JNV_PRINCIPAL_UPLOADS_ROOT) + sep))
      await unlink(absolute).catch(() => undefined);
  }

  private toResponse(principal: JnvPrincipal) {
    return {
      id: principal.id,
      organizationId: principal.organizationId,
      principalNameEnglish: principal.principalNameEnglish,
      principalNameHindi: principal.principalNameHindi,
      principalDesignationEnglish: principal.principalDesignationEnglish,
      principalDesignationHindi: principal.principalDesignationHindi,
      email: principal.email,
      mobile: principal.mobile,
      messageEnglish: principal.messageEnglish,
      messageHindi: principal.messageHindi,
      pictureUrl: principal.imagePath
        ? `/api/jnvs/${principal.organizationId}/principals/${principal.id}/image`
        : null,
      mimeType: principal.mimeType,
      extension: principal.extension,
      fileSize: principal.fileSize?.toString() ?? null,
      joinedAt: principal.joinedAt,
      relievedAt: principal.relievedAt,
      displayOrder: principal.displayOrder,
      isActive: principal.isActive,
      createdAt: principal.createdAt,
      updatedAt: principal.updatedAt,
    };
  }

  private toPublicResponse(principal: JnvPrincipal) {
    return {
      id: principal.id,
      organization_id: principal.organizationId,
      principal_name_english: principal.principalNameEnglish,
      principal_name_hindi: principal.principalNameHindi,
      principal_designation_english: principal.principalDesignationEnglish,
      principal_designation_hindi: principal.principalDesignationHindi,
      email: principal.email,
      mobile: principal.mobile,
      message_english: principal.messageEnglish,
      message_hindi: principal.messageHindi,
      picture_url: principal.imagePath
        ? `/api/public/jnvs/${principal.organizationId}/principals/${principal.id}/image`
        : null,
      joined_at: principal.joinedAt,
      relieved_at: principal.relievedAt,
      display_order: principal.displayOrder,
    };
  }
}
