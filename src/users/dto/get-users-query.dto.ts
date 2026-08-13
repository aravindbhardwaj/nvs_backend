import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { UserStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';

export class GetUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_type_id?: number;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

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
    'name',
    'email',
    'organizationTypeId',
    'status',
    'organizationId',
    'createdAt',
    'updatedAt',
  ])
  sort = 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder)
  order: SortOrder = SortOrder.DESC;
}
