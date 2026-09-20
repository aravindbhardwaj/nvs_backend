import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';

export class GetStatesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ro_id?: number;
  @IsOptional() @IsUUID() ro_uuid?: string;

  @IsOptional()
  @IsIn(['stateName', 'stateCode', 'roId', 'isoCode'])
  sort = 'stateName';

  @IsOptional()
  @IsEnum(SortOrder)
  order: SortOrder = SortOrder.ASC;
}
