import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const boolean = ({ value }: { value: unknown }) =>
  value === undefined ? undefined : value === true || value === 'true';

export class CreateGalleryImageDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(255) title: string;
  @IsOptional() @Transform(trim) @IsString() description?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(255) altText?: string;
  @IsOptional() @Type(() => Number) @IsInt() displayOrder?: number;
  @IsOptional() @Transform(boolean) @IsBoolean() isActive?: boolean;
}
