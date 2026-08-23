import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
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

const toBoolean = ({ value }: { value: unknown }): unknown =>
  value === undefined || value === null
    ? value
    : value === true || value === 'true';

export class UpdateMediaDto {
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
  descriptionEnglish?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  descriptionHindi?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  mediaTypeId?: number;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  sharedMediaTypeIds?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  display_order?: number;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  visible_to_all?: boolean | null;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  ro_ids?: string | null;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  jnv_ids?: string | null;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  important_link_1?: boolean | null;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  important_link_2?: boolean | null;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  important_link_3?: boolean | null;

  @IsOptional()
  @IsDateString({ strict: true })
  start_date?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  end_date?: string | null;
}
