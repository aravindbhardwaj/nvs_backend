import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PageStatus } from '@prisma/client';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreatePageDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  contentTypeId: number;

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
  shortDescriptionEnglish?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  shortDescriptionHindi?: string;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  contentEnglish: string;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  contentHindi: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @IsOptional()
  @IsDateString()
  start_date?: string | null;

  @IsOptional()
  @IsDateString()
  end_date?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  display_order?: number;
}
