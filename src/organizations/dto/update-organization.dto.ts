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
  @MaxLength(255)
  name_en?: string | null;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @MaxLength(255)
  name_hi?: string | null;

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
  @IsOptional() @IsUUID() organizationTypeUuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentOrganizationId?: number | null;
  @IsOptional() @IsUUID() parentOrganizationUuid?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  regionId?: number | null;
  @IsOptional() @IsUUID() regionUuid?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stateId?: number | null;
  @IsOptional() @IsUUID() stateUuid?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  districtId?: number | null;
  @IsOptional() @IsUUID() districtUuid?: string | null;

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

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  addressHindi?: string | null;

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
