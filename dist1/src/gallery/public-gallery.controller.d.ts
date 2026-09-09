import type { Response } from 'express';
import { GetPublicGalleryImagesQueryDto } from './dto/get-public-gallery-images-query.dto';
import { GalleryService } from './gallery.service';
export declare class PublicGalleryController {
    private readonly gallery;
    constructor(gallery: GalleryService);
    findAll(query: GetPublicGalleryImagesQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/gallery-image-response.dto").PublicGalleryImageResponseDto>;
    }>;
    image(id: number, organizationId: string | undefined, response: Response): Promise<void>;
}
