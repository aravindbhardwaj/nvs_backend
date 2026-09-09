import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';
export declare class GetLeadersQueryDto extends PaginationQueryDto {
    isActive?: boolean;
    isDeleted?: boolean;
    sort: string;
    order: SortOrder;
}
