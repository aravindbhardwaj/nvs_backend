import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationOwnershipService } from '../services/organization-ownership.service';
import { OrganizationOwnershipGuard } from './organization-ownership.guard';

const uuid = '550e8400-e29b-41d4-a716-446655440000';
describe('Organization ownership with UUID routes', () => {
  it.each(['page', 'media', 'banner', 'galleryImage'])(
    '%s enforces ownership before controller execution',
    async (resource) => {
      const findUnique = jest.fn().mockResolvedValue({ organizationId: 20 });
      const prisma = { [resource]: { findUnique } } as unknown as PrismaService;
      const reflector = {
        getAllAndOverride: () => resource,
      } as unknown as Reflector;
      const guard = new OrganizationOwnershipGuard(
        reflector,
        prisma,
        new OrganizationOwnershipService(),
      );
      const req = {
        user: { id: 1, role: Role.JNV, organizationId: 10 },
        params: { uuid },
      };
      const context = {
        getHandler: () => null,
        getClass: () => null,
        switchToHttp: () => ({ getRequest: () => req }),
      } as unknown as ExecutionContext;
      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(findUnique).toHaveBeenCalledWith({
        where: { uuid },
        select: { organizationId: true },
      });
      findUnique.mockResolvedValue({ organizationId: 10 });
      await expect(guard.canActivate(context)).resolves.toBe(true);
      req.params.uuid = 'invalid';
      findUnique.mockClear();
      await expect(guard.canActivate(context)).rejects.toMatchObject({
        status: 400,
      });
      expect(findUnique).not.toHaveBeenCalled();
    },
  );
});
