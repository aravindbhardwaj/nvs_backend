import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  IsDefined,
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

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @MaxLength(255)
  name_en?: string | null;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @MaxLength(255)
  name_hi?: string | null;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  organizationCode: string;

  @ValidateIf(
    (dto: CreateOrganizationDto) => dto.organizationTypeUuid === undefined,
  )
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationTypeId?: number;

  @IsOptional()
  @IsUUID()
  organizationTypeUuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentOrganizationId?: number;

  @IsOptional()
  @IsUUID()
  parentOrganizationUuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  regionId?: number;

  @IsOptional()
  @IsUUID()
  regionUuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stateId?: number;

  @IsOptional()
  @IsUUID()
  stateUuid?: string;

  /** Optional and nullable; references the existing District Master. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  districtId?: number | null;

  @IsOptional()
  @IsUUID()
  districtUuid?: string | null;

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

  @ValidateIf((_, value) => value !== undefined)
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  addressHindi?: string;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  address_en?: string | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  address_hi?: string | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  director_name_en?: string | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  director_name_hi?: string | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  phone_number?: string | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  email_address?: string | null;

  @IsOptional()
  @IsBoolean()
  isFunctional?: boolean;
}
