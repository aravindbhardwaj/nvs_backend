import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

import {
  ORGANIZATION_OWNED_RESOURCE_KEY,
  type OrganizationOwnedResource,
} from '../decorators/organization-owned-resource.decorator';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationOwnershipService } from '../services/organization-ownership.service';

@Injectable()
export class OrganizationOwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly ownership: OrganizationOwnershipService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource =
      this.reflector.getAllAndOverride<OrganizationOwnedResource>(
        ORGANIZATION_OWNED_RESOURCE_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!resource) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      body?: Record<string, unknown>;
      query?: Record<string, unknown>;
      params?: Record<string, string | undefined>;
    }>();
    const user = request.user;

    if (!user || user.role === Role.SUPER_ADMIN) {
      return true;
    }

    const requestedOrganizationId = this.toPositiveInteger(
      request.body?.organizationId ?? request.query?.organizationId,
    );
    if (requestedOrganizationId) {
      this.ownership.assertAccess(requestedOrganizationId, user);
      return true;
    }

    const id = this.toPositiveInteger(request.params?.id);
    if (id) {
      const record =
        resource === 'page'
          ? await this.prisma.page.findUnique({
              where: { id },
              select: { organizationId: true },
            })
          : resource === 'media'
            ? await this.prisma.media.findUnique({
                where: { id },
                select: { organizationId: true },
              })
            : resource === 'banner'
              ? await this.prisma.banner.findUnique({
                  where: { id },
                  select: { organizationId: true },
                })
              : await this.prisma.galleryImage.findUnique({
                  where: { id },
                  select: { organizationId: true },
                });
      if (record) {
        this.ownership.assertAccess(record.organizationId, user);
      }
      return true;
    }

    if (resource === 'page' && request.params?.slug) {
      const page = await this.prisma.page.findFirst({
        where: { slug: request.params.slug },
        select: { organizationId: true },
      });
      if (page) {
        this.ownership.assertAccess(page.organizationId, user);
      }
    }

    return true;
  }

  private toPositiveInteger(value: unknown): number | undefined {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
  }
}
