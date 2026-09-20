import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class PermissionOverrideDto {
  @ValidateIf((dto: PermissionOverrideDto) => dto.permissionUuid === undefined)
  @IsInt()
  permissionId?: number;

  @IsOptional() @IsUUID() permissionUuid?: string;

  @IsBoolean()
  allowed: boolean;
}
