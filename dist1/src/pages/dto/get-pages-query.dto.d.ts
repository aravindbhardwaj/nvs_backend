import { PageStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';
export declare class GetPagesQueryDto extends PaginationQueryDto {
    organizationId?: number;
    contentTypeId?: number;
    status?: PageStatus;
    isDeleted?: boolean;
    sort: string;
    order: SortOrder;
}
