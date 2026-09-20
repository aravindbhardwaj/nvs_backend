import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class GetPublicPagesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_id?: number;
  @IsOptional() @IsUUID() organization_uuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  content_type_id?: number;
  @IsOptional() @IsUUID() content_type_uuid?: string;
}
