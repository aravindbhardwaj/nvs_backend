import { IsBoolean, IsInt } from 'class-validator';

export class PermissionOverrideDto {
  @IsInt()
  permissionId: number;

  @IsBoolean()
  allowed: boolean;
}
