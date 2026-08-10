import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class OrganizationOwnershipService {
  assertAccess(organizationId: number, user: AuthenticatedUser): void {
    if (
      user.role !== Role.SUPER_ADMIN &&
      user.organizationId !== organizationId
    ) {
      throw new ForbiddenException(
        'You can only access resources belonging to your organization.',
      );
    }
  }
}
