import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EffectivePermissionsService } from '../services/effective-permissions.service';
export declare class PermissionsGuard implements CanActivate {
    private readonly reflector;
    private readonly effectivePermissions;
    constructor(reflector: Reflector, effectivePermissions: EffectivePermissionsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
