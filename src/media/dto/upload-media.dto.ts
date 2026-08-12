import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UploadMediaDto {
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

  @Type(() => Number)
  @IsInt()
  @Min(1)
  mediaTypeId: number;
}
