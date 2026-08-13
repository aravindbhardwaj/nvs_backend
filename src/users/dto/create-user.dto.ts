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

export class CreateUserDto {
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;

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

  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_type_id: number;
}
