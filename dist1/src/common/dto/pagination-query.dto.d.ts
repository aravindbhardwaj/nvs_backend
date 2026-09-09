import { SortOrder } from '../enums/sort-order.enum';
export declare class PaginationQueryDto {
    page: number;
    limit: number;
    search?: string;
    sort?: string;
    order: SortOrder;
}
