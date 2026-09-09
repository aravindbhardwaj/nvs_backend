import type { Response } from 'express';
import { GetPublicMediaQueryDto } from './dto/get-public-media-query.dto';
import { MediaService } from './media.service';
export declare class PublicMediaController {
    private readonly media;
    constructor(media: MediaService);
    findAll(query: GetPublicMediaQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/public-media-response.dto").PublicMediaResponseDto>;
    }>;
    findImportantLink1(query: GetPublicMediaQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/public-media-response.dto").PublicMediaResponseDto>;
    }>;
    findImportantLink2(query: GetPublicMediaQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/public-media-response.dto").PublicMediaResponseDto>;
    }>;
    findImportantLink3(query: GetPublicMediaQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/public-media-response.dto").PublicMediaResponseDto>;
    }>;
    download(id: number, organizationId: string | undefined, response: Response): Promise<void>;
    downloadHindi(id: number, organizationId: string | undefined, response: Response): Promise<void>;
}
