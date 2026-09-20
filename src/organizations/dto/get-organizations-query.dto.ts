import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  Max,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';

export class GetOrganizationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(1000)
  limit = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationTypeId?: number;
  @IsOptional() @IsUUID() organizationTypeUuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  regionId?: number;
  @IsOptional() @IsUUID() regionUuid?: string;

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
  districtId?: number;
  @IsOptional() @IsUUID() districtUuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentOrganizationId?: number;
  @IsOptional() @IsUUID() parentOrganizationUuid?: string;

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
    'districtId',
    'createdAt',
    'updatedAt',
  ])
  sort = 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder)
  order: SortOrder = SortOrder.DESC;
}
