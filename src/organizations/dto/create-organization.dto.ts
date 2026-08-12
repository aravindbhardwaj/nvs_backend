import { Transform, Type } from 'class-transformer';
import {
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

  @ValidateIf((_, value) => value !== undefined)
  @Transform(trimValue)
  @IsString()
  @MaxLength(5000)
  address?: string;
}
