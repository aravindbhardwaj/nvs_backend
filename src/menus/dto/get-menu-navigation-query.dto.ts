import { Type } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';

import { MENU_LOCATION_VALUES } from '../menu.constants';

export class GetMenuNavigationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_type_id: number;

  @Type(() => Number)
  @IsIn(MENU_LOCATION_VALUES)
  menu_location: number;
}
