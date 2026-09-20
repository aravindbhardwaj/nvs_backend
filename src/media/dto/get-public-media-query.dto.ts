import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class GetPublicMediaQueryDto extends PaginationQueryDto {
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
  media_type_id?: number;
  @IsOptional() @IsUUID() media_type_uuid?: string;
}
