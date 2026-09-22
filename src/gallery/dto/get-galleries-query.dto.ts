import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class GetGalleriesQueryDto extends PaginationQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) organizationId?: number;
  @IsOptional() @IsUUID() organizationUuid?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
