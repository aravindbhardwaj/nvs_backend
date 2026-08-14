import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Min } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { MENU_LOCATION_VALUES } from '../menu.constants';

export class GetMenusQueryDto extends PaginationQueryDto {
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
  parent_menu_id?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  is_deleted?: boolean;
}
