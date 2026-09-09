import { SortOrder } from '../../common/enums/sort-order.enum';
export declare class GetAuditLogsQueryDto {
    page: number;
    limit: number;
    search?: string;
    module?: string;
    userId?: number;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
    order: SortOrder;
}
