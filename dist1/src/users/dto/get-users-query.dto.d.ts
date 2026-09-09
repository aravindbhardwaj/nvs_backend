import { UserStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';
export declare class GetUsersQueryDto extends PaginationQueryDto {
    organizationId?: number;
    organization_type_id?: number;
    status?: UserStatus;
    isDeleted?: boolean;
    sort: string;
    order: SortOrder;
}
