import type { Response } from 'express';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { GalleryService } from './gallery.service';
import { BulkDeleteGalleryImagesDto } from './dto/bulk-delete-gallery-images.dto';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { GetGalleryImagesQueryDto } from './dto/get-gallery-images-query.dto';
import { ReorderGalleryImagesDto } from './dto/reorder-gallery-images.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
export declare class GalleryController {
    private readonly gallery;
    constructor(gallery: GalleryService);
    create(dto: CreateGalleryImageDto, file: Express.Multer.File | undefined, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/gallery-image-response.dto").GalleryImageResponseDto;
    }>;
    bulkUpload(dto: CreateGalleryImageDto, files: Express.Multer.File[] | undefined, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/gallery-image-response.dto").GalleryImageResponseDto[];
    }>;
    findAll(query: GetGalleryImagesQueryDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/gallery-image-response.dto").GalleryImageResponseDto & {
            organization_name: string;
        }>;
    }>;
    image(id: number, user: AuthenticatedUser, response: Response): Promise<void>;
    findOne(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/gallery-image-response.dto").GalleryImageResponseDto;
    }>;
    reorder(dto: ReorderGalleryImagesDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: null;
    }>;
    update(id: number, dto: UpdateGalleryImageDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/gallery-image-response.dto").GalleryImageResponseDto;
    }>;
    replace(id: number, file: Express.Multer.File | undefined, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/gallery-image-response.dto").GalleryImageResponseDto;
    }>;
    bulkDelete(dto: BulkDeleteGalleryImagesDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/gallery-image-response.dto").GalleryImageResponseDto[];
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/gallery-image-response.dto").GalleryImageResponseDto;
    }>;
}
