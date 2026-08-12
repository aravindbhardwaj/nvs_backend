import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';

export class GetOrganizationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  regionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stateId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentOrganizationId?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === true || value === 'true'
      ? true
      : value === false || value === 'false'
        ? false
        : value,
  )
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsIn([
    'organizationName',
    'organizationCode',
    'organizationTypeId',
    'createdAt',
    'updatedAt',
  ])
  sort = 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder)
  order: SortOrder = SortOrder.DESC;
}
