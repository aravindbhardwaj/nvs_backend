import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const boolean = ({ value }: { value: unknown }): unknown =>
  value === undefined ? undefined : value === true || value === 'true';

export class GetModalsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(boolean)
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsIn([
    'text_english',
    'text_hindi',
    'display_order',
    'isActive',
    'start_date',
    'end_date',
    'createdAt',
    'updatedAt',
  ])
  sort = 'display_order';
}
