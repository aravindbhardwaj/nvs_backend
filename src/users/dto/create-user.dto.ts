import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
  Min,
  ValidateIf,
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

  @IsOptional()
  @Transform(normalizeEmail)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  username?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9+/]{342}==$/)
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

  @ValidateIf((dto: CreateUserDto) => dto.organizationUuid === undefined)
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId?: number;

  @IsOptional()
  @IsUUID()
  organizationUuid?: string;

  @ValidateIf((dto: CreateUserDto) => dto.organization_type_uuid === undefined)
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_type_id?: number;

  @IsOptional()
  @IsUUID()
  organization_type_uuid?: string;
}
