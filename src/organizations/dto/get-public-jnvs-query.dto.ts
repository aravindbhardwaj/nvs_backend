import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class GetPublicJnvsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(1000)
  limit = 20;

  @IsOptional()
  @Transform(({ value }) => String(value).trim().toUpperCase())
  @IsString()
  state_code?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  district_id?: number;
  @IsOptional() @IsUUID() district_uuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  regional_office_id?: number;
  @IsOptional() @IsUUID() regional_office_uuid?: string;
}
