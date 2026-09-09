import type { Response } from 'express';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { GetBannersQueryDto } from './dto/get-banners-query.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
export declare class BannersController {
    private readonly bannersService;
    constructor(bannersService: BannersService);
    create(dto: CreateBannerDto, file: Express.Multer.File | undefined, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/banner-response.dto").BannerResponseDto;
    }>;
    findAll(query: GetBannersQueryDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/banner-response.dto").BannerResponseDto & {
            organization_name: string;
        }>;
    }>;
    image(id: number, user: AuthenticatedUser, response: Response): Promise<void>;
    findOne(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/banner-response.dto").BannerResponseDto;
    }>;
    update(id: number, dto: UpdateBannerDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/banner-response.dto").BannerResponseDto;
    }>;
    replaceImage(id: number, file: Express.Multer.File | undefined, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/banner-response.dto").BannerResponseDto;
    }>;
    activate(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/banner-response.dto").BannerResponseDto;
    }>;
    deactivate(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/banner-response.dto").BannerResponseDto;
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/banner-response.dto").BannerResponseDto;
    }>;
    restore(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/banner-response.dto").BannerResponseDto;
    }>;
}
