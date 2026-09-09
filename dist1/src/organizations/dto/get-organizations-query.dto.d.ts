import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';
export declare class GetOrganizationsQueryDto extends PaginationQueryDto {
    limit: number;
    organizationTypeId?: number;
    regionId?: number;
    stateId?: number;
    districtId?: number;
    parentOrganizationId?: number;
    isDeleted?: boolean;
    sort: string;
    order: SortOrder;
}
