import { GetPublicPagesQueryDto } from './dto/get-public-pages-query.dto';
import { PagesService } from './pages.service';
export declare class PublicPagesController {
    private readonly pages;
    constructor(pages: PagesService);
    findAll(query: GetPublicPagesQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/public-page-response.dto").PublicPageResponseDto>;
    }>;
    findBySlug(slug: string): Promise<{
        message: string;
        data: import("./dto/public-page-response.dto").PublicPageResponseDto;
    }>;
}
