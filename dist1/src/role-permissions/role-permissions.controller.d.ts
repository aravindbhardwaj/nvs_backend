import { Role } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ReplaceRolePermissionsDto } from './dto/replace-role-permissions.dto';
import { RolePermissionsService } from './role-permissions.service';
export declare class RolePermissionsController {
    private readonly rolePermissionsService;
    constructor(rolePermissionsService: RolePermissionsService);
    findByRole(role: Role): Promise<{
        message: string;
        data: import("./dto/role-permissions-response.dto").RolePermissionsResponseDto;
    }>;
    replace(role: Role, dto: ReplaceRolePermissionsDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/role-permissions-response.dto").RolePermissionsResponseDto;
    }>;
}
