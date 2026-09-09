import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';
export declare class GetGalleryImagesQueryDto extends PaginationQueryDto {
    organizationId?: number;
    isActive?: boolean;
    isDeleted?: boolean;
    sort: string;
    order: SortOrder;
}
