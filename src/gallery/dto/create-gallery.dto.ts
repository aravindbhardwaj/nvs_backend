import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateGalleryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) organizationId?: number;
  @IsOptional() @IsUUID() organizationUuid?: string;
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleEnglish: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  titleHindi?: string;
  @IsOptional() @Transform(trim) @IsString() descriptionEnglish?: string;
  @IsOptional() @Transform(trim) @IsString() descriptionHindi?: string;
  @IsOptional() @Type(() => Number) @IsInt() display_order?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
