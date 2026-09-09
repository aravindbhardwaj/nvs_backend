import { PaginationMetaDto } from '../dto/pagination-meta.dto';
export declare class PaginationUtil {
    static buildMeta(page: number, limit: number, totalItems: number): PaginationMetaDto;
}
