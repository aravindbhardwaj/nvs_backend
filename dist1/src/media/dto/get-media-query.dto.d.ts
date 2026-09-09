import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';
export declare class GetMediaQueryDto extends PaginationQueryDto {
    organizationId?: number;
    mediaTypeId?: number;
    isDeleted?: boolean;
    is_active?: boolean;
    sort: string;
    order: SortOrder;
}
