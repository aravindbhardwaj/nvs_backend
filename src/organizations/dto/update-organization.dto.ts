import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateOrganizationDto {
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  organizationName?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @MaxLength(255)
  organizationHindiName?: string | null;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  organizationCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentOrganizationId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  regionId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stateId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  districtId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estdYear?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  studentsCount?: number | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  address?: string | null;

  @IsOptional()
  @IsBoolean()
  isFunctional?: boolean;
}
