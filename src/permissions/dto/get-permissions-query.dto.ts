import { IsIn, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class GetPermissionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['permissionKey', 'module', 'action', 'createdAt'])
  sort = 'permissionKey';
}
