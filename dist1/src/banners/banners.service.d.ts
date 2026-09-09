import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'node:fs';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { OrganizationOwnershipService } from '../auth/services/organization-ownership.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BannerResponseDto, PublicBannerResponseDto } from './dto/banner-response.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { GetBannersQueryDto } from './dto/get-banners-query.dto';
import { GetPublicBannersQueryDto } from './dto/get-public-banners-query.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
export declare class BannersService {
    private readonly prisma;
    private readonly ownership;
    private readonly configService;
    constructor(prisma: PrismaService, ownership: OrganizationOwnershipService, configService: ConfigService);
    create(dto: CreateBannerDto, file: Express.Multer.File, actor: AuthenticatedUser): Promise<BannerResponseDto>;
    findAll(query: GetBannersQueryDto, actor: AuthenticatedUser): Promise<PaginatedResponseDto<BannerResponseDto & {
        organization_name: string;
    }>>;
    findOne(id: number, actor: AuthenticatedUser): Promise<BannerResponseDto>;
    update(id: number, dto: UpdateBannerDto, actor: AuthenticatedUser): Promise<BannerResponseDto>;
    replaceImage(id: number, file: Express.Multer.File, actor: AuthenticatedUser): Promise<BannerResponseDto>;
    setActive(id: number, isActive: boolean, actor: AuthenticatedUser): Promise<BannerResponseDto>;
    remove(id: number, actor: AuthenticatedUser): Promise<BannerResponseDto>;
    restore(id: number, actor: AuthenticatedUser): Promise<BannerResponseDto>;
    findDisplayable(query: GetPublicBannersQueryDto): Promise<PaginatedResponseDto<PublicBannerResponseDto>>;
    imageStream(id: number, actor: AuthenticatedUser): Promise<{
        stream: ReturnType<typeof createReadStream>;
        mimeType: string;
    }>;
    publicImageStream(id: number, organizationId?: number): Promise<{
        stream: ReturnType<typeof createReadStream>;
        mimeType: string;
    }>;
    cleanupUploadedFile(file?: Express.Multer.File): Promise<void>;
    private openImage;
    private findActiveBanner;
    private findViewableBanner;
    private ensureActiveOrganization;
    private buildWhere;
    private visibilityWhere;
    private assertBannerUploadLimit;
    private maxBannersPerOrganization;
    private displayableWhere;
    private publicDisplayableWhere;
    private assertDisplayDates;
    private createAuditLog;
    private toResponse;
    private toPublicResponse;
    private toAuditValues;
    private extensionOf;
    private toStoredPath;
    private absolutePath;
    private removePhysicalFile;
}
