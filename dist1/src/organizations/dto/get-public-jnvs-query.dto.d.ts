import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class GetPublicJnvsQueryDto extends PaginationQueryDto {
    limit: number;
    state_code?: string;
    district_id?: number;
    regional_office_id?: number;
}
