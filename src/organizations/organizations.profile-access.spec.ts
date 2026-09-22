import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

import { REQUIRED_PERMISSIONS_KEY } from '../auth/decorators/require-permission.decorator';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ROLE_PERMISSIONS } from '../../prisma/seed/constants';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

const organizationRoles = [Role.HEADQUARTER, Role.NLI, Role.REGIONAL, Role.JNV];

describe('Organization profile access', () => {
  it('allows all organization roles through the profile route metadata', () => {
    const expectedRoles = [Role.SUPER_ADMIN, ...organizationRoles];

    for (const method of ['findOneByUuid', 'updateProfileByUuid'] as const) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          OrganizationsController.prototype[method],
        ),
      ).toEqual(expectedRoles);
    }

    expect(
      Reflect.getMetadata(
        REQUIRED_PERMISSIONS_KEY,
        OrganizationsController.prototype.findOneByUuid,
      ),
    ).toEqual(['ORGANIZATION_VIEW']);
    expect(
      Reflect.getMetadata(
        REQUIRED_PERMISSIONS_KEY,
        OrganizationsController.prototype.updateProfileByUuid,
      ),
    ).toEqual(['ORGANIZATION_UPDATE']);
  });

  it('seeds profile view and update permissions for every organization role', () => {
    for (const role of organizationRoles) {
      expect(ROLE_PERMISSIONS[role]).toEqual(
        expect.arrayContaining(['ORGANIZATION_VIEW', 'ORGANIZATION_UPDATE']),
      );
    }
  });

  it('rejects viewing another organization profile', async () => {
    const prisma = {
      organization: { findFirst: jest.fn().mockResolvedValue({ id: 2 }) },
    };
    const service = new OrganizationsService(prisma as never);
    const actor = {
      id: 10,
      email: 'jnv@example.com',
      role: Role.JNV,
      organizationId: 1,
      organizationTypeId: 4,
    } satisfies AuthenticatedUser;

    await expect(
      service.findOneByUuid('organization-uuid', actor),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects updating another organization profile before writing', async () => {
    const transaction = {
      organization: {
        findFirst: jest.fn().mockResolvedValue({ id: 2, imageUrl: null }),
        update: jest.fn(),
      },
      auditLog: { create: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn((callback) => callback(transaction)),
    };
    const service = new OrganizationsService(prisma as never);
    const actor = {
      id: 10,
      email: 'ro@example.com',
      role: Role.REGIONAL,
      organizationId: 1,
      organizationTypeId: 3,
    } satisfies AuthenticatedUser;

    await expect(
      service.updateProfileByUuid(
        'organization-uuid',
        { short_description: 'Updated' },
        actor,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(transaction.organization.update).not.toHaveBeenCalled();
  });

  it('allows a Super Admin to update another non-deleted organization', async () => {
    const organization = { id: 2, imageUrl: null };
    const transaction = {
      organization: {
        findFirst: jest.fn().mockResolvedValue(organization),
        update: jest.fn().mockResolvedValue(organization),
      },
      auditLog: { create: jest.fn().mockResolvedValue(undefined) },
    };
    const prisma = {
      $transaction: jest.fn((callback) => callback(transaction)),
    };
    const service = new OrganizationsService(prisma as never);
    jest
      .spyOn(service as never, 'toAuditValues' as never)
      .mockReturnValue({} as never);
    jest
      .spyOn(service as never, 'toResponse' as never)
      .mockReturnValue({} as never);
    const actor = {
      id: 1,
      email: 'admin@example.com',
      role: Role.SUPER_ADMIN,
      organizationId: 1,
      organizationTypeId: 1,
    } satisfies AuthenticatedUser;

    await service.updateProfileByUuid(
      'organization-uuid',
      {
        short_description: 'Updated',
        short_description_hi: 'अपडेट किया गया',
      },
      actor,
    );

    expect(transaction.organization.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shortDescription: 'Updated',
          shortDescriptionHi: 'अपडेट किया गया',
        }),
      }),
    );
  });
});
