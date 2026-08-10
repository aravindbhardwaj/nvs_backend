import { Role } from '@prisma/client';

import { PermissionResponseDto } from '../../permissions/dto/permission-response.dto';

export class RolePermissionsResponseDto {
  role: Role;
  permissions: PermissionResponseDto[];
}
