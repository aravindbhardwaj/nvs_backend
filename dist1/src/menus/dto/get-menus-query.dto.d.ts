import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class GetMenusQueryDto extends PaginationQueryDto {
    organization_type_id?: number;
    menu_location?: number;
    parent_menu_id?: number;
    is_active?: boolean;
    is_deleted?: boolean;
}
