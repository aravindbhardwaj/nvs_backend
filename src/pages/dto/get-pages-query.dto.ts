import { PageStatus } from '@prisma/client';
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

export class GetPagesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId?: number;
  @IsOptional() @IsUUID() organizationUuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contentTypeId?: number;
  @IsOptional() @IsUUID() contentTypeUuid?: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? undefined : value === true || value === 'true',
  )
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsIn([
    'titleEnglish',
    'slug',
    'status',
    'display_order',
    'publishedAt',
    'createdAt',
    'updatedAt',
  ])
  sort = 'display_order';

  order: SortOrder = SortOrder.ASC;
}
