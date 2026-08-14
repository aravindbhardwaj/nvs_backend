import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

import { LINK_TARGET_VALUES, MENU_LOCATION_VALUES } from '../menu.constants';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;
const toBoolean = ({ value }: { value: unknown }): unknown =>
  value === undefined || value === null
    ? value
    : value === true || value === 'true';

export class UpdateMenuDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_type_id?: number;
  @IsOptional()
  @Type(() => Number)
  @IsIn(MENU_LOCATION_VALUES)
  menu_location?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parent_menu_id?: number | null;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title_english?: string;
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title_hindi?: string | null;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  content_type_id?: number | null;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  media_type_id?: number | null;
  @IsOptional()
  @Transform(trimValue)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  external_url?: string | null;
  @IsOptional()
  @Type(() => Number)
  @IsIn(LINK_TARGET_VALUES)
  link_target?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  display_order?: number;
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  is_active?: boolean;
}
