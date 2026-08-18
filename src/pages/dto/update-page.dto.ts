import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdatePageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contentTypeId?: number;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleEnglish?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleHindi?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  shortDescriptionEnglish?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  shortDescriptionHindi?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  contentEnglish?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  contentHindi?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string | null;

  @IsOptional()
  @IsDateString()
  end_date?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;
}
