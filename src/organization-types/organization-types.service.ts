import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organizationType.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true },
      orderBy: { id: 'asc' },
    });
  }
}
