import { Injectable, NotFoundException } from '@nestjs/common';
import { Permission, Prisma } from '@prisma/client';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { GetPermissionsQueryDto } from './dto/get-permissions-query.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: GetPermissionsQueryDto,
  ): Promise<PaginatedResponseDto<PermissionResponseDto>> {
    const { page, limit, search, sort, order } = query;
    const where = this.buildWhere(search);
    const orderBy: Prisma.PermissionOrderByWithRelationInput = {
      [sort]: order,
    };

    const [permissions, totalItems] = await this.prisma.$transaction([
      this.prisma.permission.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.permission.count({ where }),
    ]);

    return {
      items: permissions.map((permission) => this.toResponse(permission)),
      meta: PaginationUtil.buildMeta(page, limit, totalItems),
    };
  }

  async findOne(id: number): Promise<PermissionResponseDto> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found.');
    }

    return this.toResponse(permission);
  }

  private buildWhere(search?: string): Prisma.PermissionWhereInput {
    if (!search) {
      return {};
    }

    return {
      OR: [
        { permissionKey: { contains: search, mode: 'insensitive' } },
        { module: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  private toResponse(permission: Permission): PermissionResponseDto {
    return {
      id: permission.id,
      permissionKey: permission.permissionKey,
      module: permission.module,
      action: permission.action,
      description: permission.description,
      createdAt: permission.createdAt,
    };
  }
}
