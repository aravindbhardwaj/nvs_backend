import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

const toBoolean = ({ value }: { value: unknown }): unknown =>
  value === undefined ? undefined : value === true || value === 'true';

export class CreateHeaderLogoDto {
  @IsOptional() @IsString() @MaxLength(255) title?: string;
  @IsOptional() @IsString() @MaxLength(255) altText?: string;
  @IsOptional() @Transform(toBoolean) @IsBoolean() display_on_jnv?: boolean;
  @IsOptional() @Transform(toBoolean) @IsBoolean() isActive?: boolean;
}

export class UpdateHeaderLogoDto {
  @IsOptional() @IsString() @MaxLength(255) title?: string;
  @IsOptional() @IsString() @MaxLength(255) altText?: string;
  @IsOptional() @Transform(toBoolean) @IsBoolean() display_on_jnv?: boolean;
  @IsOptional() @Transform(toBoolean) @IsBoolean() isActive?: boolean;
}

export class HeaderLogoResponseDto {
  id: number;
  uuid: string;
  title: string | null;
  altText: string | null;
  imageUrl: string;
  mimeType: string;
  fileSize: string;
  display_on_jnv: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
