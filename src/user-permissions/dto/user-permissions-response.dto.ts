import { UserPermissionOverrideResponseDto } from './user-permission-override-response.dto';

export class UserPermissionsResponseDto {
  userId: number;
  permissions: UserPermissionOverrideResponseDto[];
}
