import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class GetPublicMediaQueryDto extends PaginationQueryDto {
    organization_id?: number;
    media_type_id?: number;
}
