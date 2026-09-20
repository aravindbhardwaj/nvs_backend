import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class ReplaceRolePermissionsDto {
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  permissionIds: number[] = [];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  permissionUuids?: string[];
}
