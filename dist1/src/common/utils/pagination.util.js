"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationUtil = void 0;
class PaginationUtil {
    static buildMeta(page, limit, totalItems) {
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
exports.PaginationUtil = PaginationUtil;
//# sourceMappingURL=pagination.util.js.map