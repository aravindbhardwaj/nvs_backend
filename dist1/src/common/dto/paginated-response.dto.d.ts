import { PaginationMetaDto } from './pagination-meta.dto';
export declare class PaginatedResponseDto<T> {
    items: T[];
    meta: PaginationMetaDto;
}
