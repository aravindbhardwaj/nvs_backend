import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';

export class GetGalleryImagesQueryDto extends PaginationQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) organizationId?: number;
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === true || value === 'true',
  )
  @IsBoolean()
  isActive?: boolean;
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === true || value === 'true',
  )
  @IsBoolean()
  isDeleted?: boolean;
  @IsOptional()
  @IsIn(['title', 'displayOrder', 'isActive', 'createdAt', 'updatedAt'])
  sort = 'displayOrder';
  order: SortOrder = SortOrder.ASC;
}
