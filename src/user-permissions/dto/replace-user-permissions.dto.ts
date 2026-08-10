import { ArrayUnique, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { PermissionOverrideDto } from './permission-override.dto';

export class ReplaceUserPermissionsDto {
  @IsArray()
  @ArrayUnique((permission: PermissionOverrideDto) => permission.permissionId)
  @ValidateNested({ each: true })
  @Type(() => PermissionOverrideDto)
  permissions: PermissionOverrideDto[];
}
