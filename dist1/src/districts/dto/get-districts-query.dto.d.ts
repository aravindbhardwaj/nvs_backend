import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';
export declare class GetDistrictsQueryDto extends PaginationQueryDto {
    stateId?: number;
    roId?: number;
    isActive: boolean;
    sort: string;
    order: SortOrder;
}
