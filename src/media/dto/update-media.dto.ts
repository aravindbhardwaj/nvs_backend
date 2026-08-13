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
  @IsDateString({ strict: true })
  start_date?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  end_date?: string | null;
}
