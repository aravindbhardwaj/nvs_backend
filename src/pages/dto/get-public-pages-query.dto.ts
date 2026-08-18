import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class GetPublicPagesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  content_type_id?: number;
}
