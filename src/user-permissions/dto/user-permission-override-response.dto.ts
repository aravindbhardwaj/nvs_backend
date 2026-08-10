import { PermissionResponseDto } from '../../permissions/dto/permission-response.dto';

export class UserPermissionOverrideResponseDto extends PermissionResponseDto {
  allowed: boolean;
}
