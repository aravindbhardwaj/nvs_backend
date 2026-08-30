import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const boolean = ({ value }: { value: unknown }): unknown =>
  value === undefined || value === null
    ? value
    : value === true || value === 'true';

export const SAFE_MODAL_LINK = /^(?:https:\/\/|\/(?!\/))\S+$/i;
export const SAFE_MODAL_LINK_MESSAGE =
  'link must be an HTTPS URL or an internal path beginning with /.';

export class CreateModalDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text_english: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text_hindi: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @Matches(SAFE_MODAL_LINK, { message: SAFE_MODAL_LINK_MESSAGE })
  link: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  display_order?: number;

  @IsOptional()
  @Transform(boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString({ strict: true })
  start_date?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  end_date?: string;
}
