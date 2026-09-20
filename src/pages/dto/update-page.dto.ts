import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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
  @IsOptional() @IsUUID() organizationUuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contentTypeId?: number;
  @IsOptional() @IsUUID() contentTypeUuid?: string;

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
