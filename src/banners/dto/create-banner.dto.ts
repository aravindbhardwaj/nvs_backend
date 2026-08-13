import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const toBoolean = ({ value }: { value: unknown }): unknown =>
  value === undefined ? undefined : value === true || value === 'true';

export class CreateBannerDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId?: number;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleEnglish: string;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleHindi: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  descriptionEnglish?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  descriptionHindi?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @MaxLength(255)
  altTextEnglish?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @MaxLength(255)
  altTextHindi?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString({ strict: true })
  start_date?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  end_date?: string;
}
