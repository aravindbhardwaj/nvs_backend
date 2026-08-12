import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';

export class GetContentTypesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined) {
      return undefined;
    }

    return value === true || value === 'true';
  })
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsIn(['nameEnglish', 'displayOrder', 'createdAt', 'updatedAt'])
  sort = 'displayOrder';

  order: SortOrder = SortOrder.ASC;
}
