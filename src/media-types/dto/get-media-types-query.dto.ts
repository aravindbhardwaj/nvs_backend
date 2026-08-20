import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';

export class GetMediaTypesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return undefined;
    return value === true || value === 'true';
  })
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsIn(['nameEnglish', 'display_order', 'createdAt', 'updatedAt'])
  sort = 'display_order';

  order: SortOrder = SortOrder.ASC;
}
