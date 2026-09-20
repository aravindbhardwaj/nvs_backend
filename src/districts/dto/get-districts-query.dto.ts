import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';

export class GetDistrictsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stateId?: number;
  @IsOptional() @IsUUID() stateUuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roId?: number;
  @IsOptional() @IsUUID() roUuid?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === true || value === 'true'
      ? true
      : value === false || value === 'false'
        ? false
        : value,
  )
  @IsBoolean()
  isActive = true;

  @IsOptional()
  @IsIn([
    'districtName',
    'districtCode',
    'stateId',
    'roId',
    'createdAt',
    'updatedAt',
  ])
  sort = 'districtName';

  @IsOptional()
  @IsEnum(SortOrder)
  order: SortOrder = SortOrder.ASC;
}
