import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class GetPublicPagesQueryDto extends PaginationQueryDto {
    organization_id?: number;
    content_type_id?: number;
}
