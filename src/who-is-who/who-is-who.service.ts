import { getAuditRequestContext } from '../common/request-context/audit-request-context';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WhoIsWho } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { OrganizationOwnershipService } from '../auth/services/organization-ownership.service';
import { PaginationUtil } from '../common/utils/pagination.util';
import {
  CreateOfficerDto,
  UpdateOfficerDto,
  GetOfficersQueryDto,
  GetPublicOfficersQueryDto,
} from './who-is-who.dto';

// Validated YYYY-MM-DD strings sort chronologically. Keep officers visible
// through their retirement day in India, independent of the server timezone.
export function indiaToday(now = new Date()): string {
  return new Date(now.getTime() + 330 * 60000).toISOString().slice(0, 10);
}

const organizationInclude = {
  organization: { select: { uuid: true } },
} as const;

type WhoIsWhoWithOrganization = Prisma.WhoIsWhoGetPayload<{
  include: typeof organizationInclude;
}>;

@Injectable()
export class WhoIsWhoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: OrganizationOwnershipService,
  ) {}

  private publicWhere(organizationId?: number): Prisma.WhoIsWhoWhereInput {
    return {
      ...(organizationId ? { organizationId } : {}),
      isDeleted: false,
      isActive: true,
      OR: [{ retirementDate: null }, { retirementDate: { gte: indiaToday() } }],
    };
  }

  private response(row: WhoIsWhoWithOrganization) {
    return {
      id: row.id,
      uuid: row.uuid,
      organizationId: row.organizationId,
      organizationUuid: row.organization.uuid,
      officerName: row.officerName,
      officerName_hi: row.officerNameHi,
      designation: row.designation,
      designation_hi: row.designationHi,
      phone: row.phone,
      email: row.email,
      retirementDate: row.retirementDate,
      displayOrder: row.displayOrder,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private publicResponse(row: WhoIsWhoWithOrganization) {
    return {
      id: row.id,
      uuid: row.uuid,
      organizationId: row.organizationId,
      organizationUuid: row.organization.uuid,
      officerName: row.officerName,
      officerName_hi: row.officerNameHi,
      designation: row.designation,
      designation_hi: row.designationHi,
      phone: row.phone,
      email: row.email,
      displayOrder: row.displayOrder,
    };
  }

  async findPublic(query: GetPublicOfficersQueryDto) {
    const organizationId = await this.resolveOrganizationId(
      undefined,
      query.organization_uuid,
    );
    const rows = await this.prisma.whoIsWho.findMany({
      include: organizationInclude,
      where: this.publicWhere(organizationId),
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
    });
    return rows.map((row) => this.publicResponse(row));
  }

  async findPublicOne(key: number | string) {
    const row = await this.prisma.whoIsWho.findFirst({
      include: organizationInclude,
      where: { ...this.publicWhere(), ...this.key(key) },
    });
    if (!row) throw new NotFoundException('Officer not found.');
    return this.publicResponse(row);
  }

  private key(key: number | string) {
    return typeof key === 'number' ? { id: key } : { uuid: key };
  }

  async findAll(query: GetOfficersQueryDto, actor: AuthenticatedUser) {
    const { page, limit, search } = query;
    const requestedOrganizationId = await this.resolveOrganizationId(
      query.organizationId,
      query.organizationUuid,
    );
    const organizationId = requestedOrganizationId ?? actor.organizationId;
    this.ownership.assertAccess(organizationId, actor);
    const where: Prisma.WhoIsWhoWhereInput = {
      organizationId,
      isDeleted: false,
      ...(search?.trim()
        ? {
            OR: [
              'officerName',
              'officerNameHi',
              'designation',
              'designationHi',
              'phone',
              'email',
            ].map((field) => ({
              [field]: { contains: search.trim(), mode: 'insensitive' },
            })),
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.whoIsWho.findMany({
        include: organizationInclude,
        where,
        orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.whoIsWho.count({ where }),
    ]);
    return {
      items: rows.map((row) => this.response(row)),
      meta: PaginationUtil.buildMeta(page, limit, total),
    };
  }

  async findOne(key: number | string, actor: AuthenticatedUser) {
    const row = await this.prisma.whoIsWho.findFirst({
      include: organizationInclude,
      where: { ...this.key(key), isDeleted: false },
    });
    if (!row) throw new NotFoundException('Officer not found.');
    this.ownership.assertAccess(row.organizationId, actor);
    return this.response(row);
  }

  private data(dto: UpdateOfficerDto) {
    return {
      officerName: dto.officerName,
      officerNameHi: dto.officerName_hi,
      designation: dto.designation,
      designationHi: dto.designation_hi,
      phone: dto.phone,
      email: dto.email,
      displayOrder: dto.displayOrder,
      isActive: dto.isActive,
      retirementDate: dto.retirementDate,
    };
  }

  async create(dto: CreateOfficerDto, actor: AuthenticatedUser) {
    const organizationId =
      (await this.resolveOrganizationId(
        dto.organizationId,
        dto.organizationUuid,
      )) ?? actor.organizationId;
    this.ownership.assertAccess(organizationId, actor);
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.whoIsWho.create({
        include: organizationInclude,
        data: {
          ...this.data(dto),
          organizationId,
          officerName: dto.officerName,
          officerNameHi: dto.officerName_hi,
          designation: dto.designation,
          designationHi: dto.designation_hi,
          phone: dto.phone,
          email: dto.email,
          createdById: actor.id,
          updatedById: actor.id,
        },
      });
      await this.audit(tx, actor.id, 'CREATE', row);
      return this.response(row);
    });
  }

  async update(
    key: number | string,
    dto: UpdateOfficerDto,
    actor: AuthenticatedUser,
  ) {
    return this.mutate(key, this.data(dto), actor, 'UPDATE');
  }

  async remove(key: number | string, actor: AuthenticatedUser) {
    return this.mutate(
      key,
      { isDeleted: true, deletedAt: new Date(), deletedById: actor.id },
      actor,
      'DELETE',
    );
  }

  private async mutate(
    key: number | string,
    data: Prisma.WhoIsWhoUncheckedUpdateInput,
    actor: AuthenticatedUser,
    action: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const before = await tx.whoIsWho.findFirst({
        include: organizationInclude,
        where: { ...this.key(key), isDeleted: false },
      });
      if (!before) throw new NotFoundException('Officer not found.');
      this.ownership.assertAccess(before.organizationId, actor);
      const row = await tx.whoIsWho.update({
        include: organizationInclude,
        where: { id: before.id, isDeleted: false },
        data: { ...data, updatedById: actor.id },
      });
      await this.audit(tx, actor.id, action, row, before);
      return this.response(row);
    });
  }

  private async resolveOrganizationId(
    id?: number,
    uuid?: string,
  ): Promise<number | undefined> {
    if (id !== undefined) return id;
    if (!uuid) return undefined;
    const organization = await this.prisma.organization.findUnique({
      where: { uuid },
      select: { id: true },
    });
    if (!organization) throw new NotFoundException('Organization not found.');
    return organization.id;
  }

  private async audit(
    tx: Prisma.TransactionClient,
    userId: number,
    action: string,
    row: WhoIsWho,
    before?: WhoIsWho,
  ) {
    const json = (value: WhoIsWho): Prisma.InputJsonValue =>
      JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
    await tx.auditLog.create({
      data: {
        ...getAuditRequestContext(),
        userId,
        module: 'WHO_IS_WHO',
        entity: 'WHO_IS_WHO',
        entityId: row.id,
        action,
        newValues: json(row),
        ...(before ? { previousValues: json(before) } : {}),
      },
    });
  }
}
