import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { REQUIRED_PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { EffectivePermissionsService } from '../services/effective-permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly effectivePermissions: EffectivePermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('You do not have permission to access this resource.');
    }

    const effectivePermissions = await this.effectivePermissions.resolve(
      user.id,
      user.role,
    );

    if (!requiredPermissions.every((permission) => effectivePermissions.has(permission))) {
      throw new ForbiddenException('You do not have permission to access this resource.');
    }

    return true;
  }
}
