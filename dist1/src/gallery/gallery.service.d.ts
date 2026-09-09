import { createReadStream } from 'node:fs';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { OrganizationOwnershipService } from '../auth/services/organization-ownership.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { GalleryImageResponseDto, PublicGalleryImageResponseDto } from './dto/gallery-image-response.dto';
import { GetGalleryImagesQueryDto } from './dto/get-gallery-images-query.dto';
import { GetPublicGalleryImagesQueryDto } from './dto/get-public-gallery-images-query.dto';
import { ReorderGalleryImagesDto } from './dto/reorder-gallery-images.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
export declare class GalleryService {
    private readonly prisma;
    private readonly ownership;
    constructor(prisma: PrismaService, ownership: OrganizationOwnershipService);
    create(dto: CreateGalleryImageDto, file: Express.Multer.File, actor: AuthenticatedUser): Promise<GalleryImageResponseDto>;
    bulkCreate(dto: CreateGalleryImageDto, files: Express.Multer.File[], actor: AuthenticatedUser): Promise<GalleryImageResponseDto[]>;
    findAll(query: GetGalleryImagesQueryDto, actor: AuthenticatedUser): Promise<PaginatedResponseDto<GalleryImageResponseDto & {
        organization_name: string;
    }>>;
    findOne(id: number, actor: AuthenticatedUser): Promise<GalleryImageResponseDto>;
    update(id: number, dto: UpdateGalleryImageDto, actor: AuthenticatedUser): Promise<GalleryImageResponseDto>;
    replaceImage(id: number, file: Express.Multer.File, actor: AuthenticatedUser): Promise<GalleryImageResponseDto>;
    remove(id: number, actor: AuthenticatedUser): Promise<GalleryImageResponseDto>;
    bulkRemove(ids: number[], actor: AuthenticatedUser): Promise<GalleryImageResponseDto[]>;
    reorder(dto: ReorderGalleryImagesDto, actor: AuthenticatedUser): Promise<void>;
    findPublic(query: GetPublicGalleryImagesQueryDto): Promise<PaginatedResponseDto<PublicGalleryImageResponseDto>>;
    imageStream(id: number, actor?: AuthenticatedUser, organizationId?: number): Promise<{
        stream: ReturnType<typeof createReadStream>;
        mimeType: string;
    }>;
    cleanupUploadedFiles(files?: Express.Multer.File[]): Promise<void>;
    private active;
    private viewable;
    private assertDateRange;
    private ensureActiveOrganization;
    private where;
    private visibilityWhere;
    private publicWhere;
    private audit;
    private response;
    private publicResponse;
    private auditValues;
    private extension;
    private filenameTitle;
    private storedPath;
    private absolutePath;
    private removeFile;
}
