import { getAuditRequestContext } from '../common/request-context/audit-request-context';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HeaderLogo, Prisma } from '@prisma/client';
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHeaderLogoDto,
  HeaderLogoResponseDto,
  UpdateHeaderLogoDto,
} from './header-logo.dto';
import {
  HEADER_LOGO_UPLOADS_ROOT,
  validateHeaderLogoImage,
} from './header-logo.storage';

@Injectable()
export class HeaderLogosService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveUuid(uuid: string): Promise<number> {
    const logo = await this.prisma.headerLogo.findUnique({
      where: { uuid },
      select: { id: true },
    });
    if (!logo) throw new NotFoundException('Header logo not found.');
    return logo.id;
  }

  async create(
    dto: CreateHeaderLogoDto,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ) {
    await validateHeaderLogoImage(file);
    const created = await this.prisma.$transaction(
      async (tx) => {
        if (dto.isActive ?? true) await this.assertLimit(tx);
        if ((dto.isActive ?? true) && dto.display_on_jnv)
          await tx.headerLogo.updateMany({
            where: {
              isActive: true,
              isDeleted: false,
              displayOnJnv: true,
            },
            data: { displayOnJnv: false, updatedById: actor.id },
          });
        const logo = await tx.headerLogo.create({
          data: {
            title: dto.title,
            altText: dto.altText,
            storedFilename: file.filename,
            imagePath: relative(process.cwd(), file.path),
            mimeType: file.mimetype,
            extension: extname(file.originalname).slice(1).toLowerCase(),
            fileSize: BigInt(file.size),
            displayOnJnv: dto.display_on_jnv ?? false,
            isActive: dto.isActive ?? true,
            createdById: actor.id,
            updatedById: actor.id,
          },
        });
        await this.audit(tx, actor.id, 'CREATE', logo);
        return logo;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return this.response(created);
  }

  async findAll() {
    const logos = await this.prisma.headerLogo.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
    return logos.map((logo) => this.response(logo));
  }

  async update(id: number, dto: UpdateHeaderLogoDto, actor: AuthenticatedUser) {
    const existing = await this.findExisting(id);
    const updated = await this.prisma.$transaction(
      async (tx) => {
        const becomingActive = dto.isActive === true && !existing.isActive;
        if (becomingActive) await this.assertLimit(tx);
        const activeAfter = dto.isActive ?? existing.isActive;
        const jnvAfter = dto.display_on_jnv ?? existing.displayOnJnv;
        if (activeAfter && jnvAfter)
          await tx.headerLogo.updateMany({
            where: {
              id: { not: id },
              isActive: true,
              isDeleted: false,
              displayOnJnv: true,
            },
            data: { displayOnJnv: false, updatedById: actor.id },
          });
        const logo = await tx.headerLogo.update({
          where: { id },
          data: {
            title: dto.title,
            altText: dto.altText,
            displayOnJnv: dto.display_on_jnv,
            isActive: dto.isActive,
            updatedById: actor.id,
          },
        });
        await this.audit(tx, actor.id, 'UPDATE', logo, existing);
        return logo;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return this.response(updated);
  }

  async replaceImage(
    id: number,
    file: Express.Multer.File,
    actor: AuthenticatedUser,
  ) {
    await validateHeaderLogoImage(file);
    const existing = await this.findExisting(id);
    const replacement = {
      storedFilename: file.filename,
      imagePath: relative(process.cwd(), file.path),
      mimeType: file.mimetype,
      extension: extname(file.originalname).slice(1).toLowerCase(),
      fileSize: BigInt(file.size),
      updatedById: actor.id,
    };
    const updated = await this.prisma.$transaction(async (tx) => {
      const logo = await tx.headerLogo.update({
        where: { id },
        data: replacement,
      });
      await this.audit(tx, actor.id, 'REPLACE_IMAGE', logo, existing);
      return logo;
    });
    try {
      await this.removeFile(existing.imagePath);
    } catch {
      await this.prisma.headerLogo.update({
        where: { id },
        data: {
          storedFilename: existing.storedFilename,
          imagePath: existing.imagePath,
          mimeType: existing.mimeType,
          extension: existing.extension,
          fileSize: existing.fileSize,
          updatedById: existing.updatedById,
        },
      });
      await this.removeFile(replacement.imagePath).catch(() => undefined);
      throw new InternalServerErrorException(
        'Unable to replace the existing header logo image.',
      );
    }
    return this.response(updated);
  }

  async remove(id: number, actor: AuthenticatedUser) {
    const existing = await this.findExisting(id);
    const deleted = await this.prisma.$transaction(async (tx) => {
      const logo = await tx.headerLogo.update({
        where: { id },
        data: {
          isDeleted: true,
          isActive: false,
          displayOnJnv: false,
          deletedAt: new Date(),
          deletedById: actor.id,
          updatedById: actor.id,
        },
      });
      await this.audit(tx, actor.id, 'DELETE', logo, existing);
      return logo;
    });
    return this.response(deleted);
  }

  async findPublic(forJnv = false) {
    return (
      await this.prisma.headerLogo.findMany({
        where: {
          ...(forJnv ? { displayOnJnv: true } : {}),
          isActive: true,
          isDeleted: false,
        },
        orderBy: { createdAt: 'asc' },
        take: forJnv ? 1 : 2,
      })
    ).map((logo) => this.response(logo, true));
  }

  async imageStream(id: number, publicOnly = false) {
    const logo = await this.prisma.headerLogo.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(publicOnly ? { isActive: true } : {}),
      },
    });
    if (!logo) throw new NotFoundException('Header logo not found.');
    const path = resolve(process.cwd(), logo.imagePath);
    if (!path.startsWith(resolve(HEADER_LOGO_UPLOADS_ROOT)))
      throw new NotFoundException('Header logo image not found.');
    return { mimeType: logo.mimeType, stream: createReadStream(path) };
  }

  async cleanup(file: Express.Multer.File) {
    await unlink(file.path).catch(() => undefined);
  }
  private removeFile(storedPath: string) {
    return unlink(resolve(process.cwd(), storedPath));
  }
  private findExisting(id: number) {
    return this.prisma.headerLogo
      .findFirst({ where: { id, isDeleted: false } })
      .then((v) => {
        if (!v) throw new NotFoundException('Header logo not found.');
        return v;
      });
  }
  private async assertLimit(tx: Prisma.TransactionClient) {
    if (
      (await tx.headerLogo.count({
        where: { isActive: true, isDeleted: false },
      })) >= 2
    )
      throw new BadRequestException(
        'A maximum of 2 active header logos is allowed.',
      );
  }
  private async audit(
    tx: Prisma.TransactionClient,
    userId: number,
    action: string,
    logo: HeaderLogo,
    previous?: HeaderLogo,
  ) {
    await tx.auditLog.create({
      data: {
        ...getAuditRequestContext(),
        userId,
        module: 'HEADER_LOGO',
        entity: 'HEADER_LOGO',
        entityId: logo.id,
        action,
        previousValues: previous ? this.auditValues(previous) : undefined,
        newValues: this.auditValues(logo),
      },
    });
  }
  private auditValues(logo: HeaderLogo): Prisma.InputJsonValue {
    return {
      id: logo.id,
      uuid: logo.uuid,
      title: logo.title,
      displayOnJnv: logo.displayOnJnv,
      isActive: logo.isActive,
      isDeleted: logo.isDeleted,
    };
  }
  private response(logo: HeaderLogo, publicUrl = false): HeaderLogoResponseDto {
    return {
      id: logo.id,
      uuid: logo.uuid,
      title: logo.title,
      altText: logo.altText,
      imageUrl: `/api/${publicUrl ? 'public/' : ''}header-logos/${logo.id}/image`,
      mimeType: logo.mimeType,
      fileSize: logo.fileSize.toString(),
      display_on_jnv: logo.displayOnJnv,
      isActive: logo.isActive,
      isDeleted: logo.isDeleted,
      createdAt: logo.createdAt,
      updatedAt: logo.updatedAt,
    };
  }
}
