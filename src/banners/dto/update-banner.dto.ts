import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const toBoolean = ({ value }: { value: unknown }): unknown =>
  value === undefined || value === null
    ? value
    : value === true || value === 'true';

export class UpdateBannerDto {
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
  @Transform(trimValue)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  link_url?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  display_order?: number;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  visible_to_all?: boolean | null;

  @IsOptional()
  @IsDateString({ strict: true })
  start_date?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  end_date?: string | null;
}
