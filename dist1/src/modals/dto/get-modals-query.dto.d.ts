import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class GetModalsQueryDto extends PaginationQueryDto {
    isActive?: boolean;
    isDeleted?: boolean;
    sort: string;
}
