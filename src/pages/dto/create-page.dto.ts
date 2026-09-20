import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsDateString,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { PageStatus } from '@prisma/client';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreatePageDto {
  @ValidateIf((dto: CreatePageDto) => dto.organizationUuid === undefined)
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId?: number;

  @ValidateIf((dto: CreatePageDto) => dto.organizationId === undefined)
  @IsDefined()
  @IsUUID()
  organizationUuid?: string;

  @ValidateIf((dto: CreatePageDto) => dto.contentTypeUuid === undefined)
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contentTypeId?: number;

  @ValidateIf((dto: CreatePageDto) => dto.contentTypeId === undefined)
  @IsDefined()
  @IsUUID()
  contentTypeUuid?: string;

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
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  section1_label_en?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  section1_label_hi?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  section2_label_en?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  section2_label_hi?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  content2_english?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  content2_hindi?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  section3_label_en?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  section3_label_hi?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  content3_english?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  content3_hindi?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  section4_label_en?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  section4_label_hi?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  content4_english?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  content4_hindi?: string;

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
