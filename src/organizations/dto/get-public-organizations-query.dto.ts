import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class GetPublicOrganizationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(1000)
  limit = 20;
}
