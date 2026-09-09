import type { Response } from 'express';
import { BannersService } from './banners.service';
import { GetPublicBannersQueryDto } from './dto/get-public-banners-query.dto';
export declare class PublicBannersController {
    private readonly bannersService;
    constructor(bannersService: BannersService);
    findDisplayable(query: GetPublicBannersQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/banner-response.dto").PublicBannerResponseDto>;
    }>;
    image(id: number, organizationId: string | undefined, response: Response): Promise<void>;
}
