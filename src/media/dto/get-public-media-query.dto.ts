import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

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

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return undefined;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsBoolean()
  is_archived?: boolean;
}
