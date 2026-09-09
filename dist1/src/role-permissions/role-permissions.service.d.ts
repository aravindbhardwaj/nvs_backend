import { Role } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { ReplaceRolePermissionsDto } from './dto/replace-role-permissions.dto';
import { RolePermissionsResponseDto } from './dto/role-permissions-response.dto';
export declare class RolePermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByRole(role: Role): Promise<RolePermissionsResponseDto>;
    replace(role: Role, dto: ReplaceRolePermissionsDto, user: AuthenticatedUser): Promise<RolePermissionsResponseDto>;
    private toPermissionResponse;
    private toAuditValues;
}
