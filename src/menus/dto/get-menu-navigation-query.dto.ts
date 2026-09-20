import { Type } from 'class-transformer';
import {
  IsDefined,
  IsIn,
  IsInt,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

import { MENU_LOCATION_VALUES } from '../menu.constants';

export class GetMenuNavigationQueryDto {
  @ValidateIf(
    (dto: GetMenuNavigationQueryDto) =>
      dto.organization_type_uuid === undefined,
  )
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_type_id?: number;
  @ValidateIf(
    (dto: GetMenuNavigationQueryDto) => dto.organization_type_id === undefined,
  )
  @IsDefined()
  @IsUUID()
  organization_type_uuid?: string;

  @Type(() => Number)
  @IsIn(MENU_LOCATION_VALUES)
  menu_location: number;
}
