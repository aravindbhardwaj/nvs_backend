import { PaginationMetaDto } from '../dto/pagination-meta.dto';

export class PaginationUtil {
  static buildMeta(
    page: number,
    limit: number,
    totalItems: number,
  ): PaginationMetaDto {
    const totalPages = Math.ceil(totalItems / limit);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }
}
