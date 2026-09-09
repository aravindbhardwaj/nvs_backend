import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreatePageDto } from './dto/create-page.dto';
import { GetPagesQueryDto } from './dto/get-pages-query.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';
export declare class PagesController {
    private readonly pagesService;
    constructor(pagesService: PagesService);
    create(dto: CreatePageDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/page-response.dto").PageResponseDto;
    }>;
    findAll(query: GetPagesQueryDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/page-response.dto").PageResponseDto & {
            organization_name: string;
        }>;
    }>;
    findBySlug(slug: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/page-response.dto").PageResponseDto;
    }>;
    findOne(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/page-response.dto").PageResponseDto;
    }>;
    update(id: number, dto: UpdatePageDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/page-response.dto").PageResponseDto;
    }>;
    publish(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/page-response.dto").PageResponseDto;
    }>;
    unpublish(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/page-response.dto").PageResponseDto;
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/page-response.dto").PageResponseDto;
    }>;
    restore(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/page-response.dto").PageResponseDto;
    }>;
}
