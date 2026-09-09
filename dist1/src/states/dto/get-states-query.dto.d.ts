import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';
export declare class GetStatesQueryDto extends PaginationQueryDto {
    ro_id?: number;
    sort: string;
    order: SortOrder;
}
