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

export class CreateOrganizationDto {
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  organizationName: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @MaxLength(255)
  organizationHindiName?: string;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  organizationCode: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationTypeId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentOrganizationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  regionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stateId?: number;

  /** Optional and nullable; references the existing District Master. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  districtId?: number | null;

  /** Optional and nullable establishment year. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estdYear?: number | null;

  /** Optional and nullable; intended for JNV organizations. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  studentsCount?: number | null;

  @ValidateIf((_, value) => value !== undefined)
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  address?: string;

  @IsOptional()
  @IsBoolean()
  isFunctional?: boolean;
}
