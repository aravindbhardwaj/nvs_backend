import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ContentTypesService } from './content-types.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { GetContentTypesQueryDto } from './dto/get-content-types-query.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
export declare class ContentTypesController {
    private readonly contentTypesService;
    constructor(contentTypesService: ContentTypesService);
    create(dto: CreateContentTypeDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/content-type-response.dto").ContentTypeResponseDto;
    }>;
    findAll(query: GetContentTypesQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/content-type-response.dto").ContentTypeResponseDto>;
    }>;
    findOne(id: number): Promise<{
        message: string;
        data: import("./dto/content-type-response.dto").ContentTypeResponseDto;
    }>;
    update(id: number, dto: UpdateContentTypeDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/content-type-response.dto").ContentTypeResponseDto;
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/content-type-response.dto").ContentTypeResponseDto;
    }>;
    restore(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/content-type-response.dto").ContentTypeResponseDto;
    }>;
}
