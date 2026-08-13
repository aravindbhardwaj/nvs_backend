import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class UpdateUserDto {
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @MaxLength(20)
  mobile?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_type_id?: number;
}
