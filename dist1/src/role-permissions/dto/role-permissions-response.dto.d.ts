import { Role } from '@prisma/client';
import { PermissionResponseDto } from '../../permissions/dto/permission-response.dto';
export declare class RolePermissionsResponseDto {
    role: Role;
    permissions: PermissionResponseDto[];
}
