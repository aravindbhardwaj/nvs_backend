import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const boolean = ({ value, obj, key }: TransformFnParams): unknown => {
  const transformedValue = value as unknown;
  const source = obj as unknown as Record<string, unknown> | null | undefined;
  const rawValue = source?.[String(key)] ?? transformedValue;
  if (rawValue === true || rawValue === 'true') return true;
  if (rawValue === false || rawValue === 'false') return false;
  return rawValue;
};

export class UpdateGalleryImageDto {
  @IsOptional() @IsUUID() galleryUuid?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleEnglish?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleHindi?: string;
  @IsOptional() @Transform(trim) @IsString() descriptionEnglish?: string;
  @IsOptional() @Transform(trim) @IsString() descriptionHindi?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  altTextEnglish?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  altTextHindi?: string;
  @IsOptional() @Type(() => Number) @IsInt() display_order?: number;
  @IsOptional() @Transform(boolean) @IsBoolean() isActive?: boolean;
  @IsOptional() @IsDateString({ strict: true }) start_date?: string | null;
  @IsOptional() @IsDateString({ strict: true }) end_date?: string | null;
}
