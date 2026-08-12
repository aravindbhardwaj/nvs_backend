import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const boolean = ({ value }: { value: unknown }) =>
  value === undefined ? undefined : value === true || value === 'true';

export class CreateGalleryImageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId?: number;
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleEnglish: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(255) titleHindi: string;
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
  @IsOptional() @Type(() => Number) @IsInt() displayOrder?: number;
  @IsOptional() @Transform(boolean) @IsBoolean() isActive?: boolean;
}
