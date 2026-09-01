import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const boolean = ({ value }: { value: unknown }) =>
  value === undefined ? undefined : value === true || value === 'true';

export class UpdateJnvPrincipalDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  principalNameEnglish?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  principalNameHindi?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  principalDesignationEnglish?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  principalDesignationHindi?: string;
  @IsOptional() @Transform(trim) @IsEmail() @MaxLength(255) email?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(20) mobile?: string;
  @IsOptional() @Transform(trim) @IsString() messageEnglish?: string;
  @IsOptional() @Transform(trim) @IsString() messageHindi?: string;
  @IsOptional() @Type(() => Date) @IsDate() joinedAt?: Date;
  @IsOptional() @Type(() => Date) @IsDate() relievedAt?: Date;
  @IsOptional() @Type(() => Number) @IsInt() displayOrder?: number;
  @IsOptional() @Transform(boolean) @IsBoolean() isActive?: boolean;
}
