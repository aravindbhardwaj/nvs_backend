import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateRegionDto } from './dto/create-region.dto';
import { GetRegionsQueryDto } from './dto/get-regions-query.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionsService } from './regions.service';
export declare class RegionsController {
    private readonly regionsService;
    constructor(regionsService: RegionsService);
    create(dto: CreateRegionDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/region-response.dto").RegionResponseDto;
    }>;
    findAll(query: GetRegionsQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/region-response.dto").RegionResponseDto>;
    }>;
    findOne(id: number): Promise<{
        message: string;
        data: import("./dto/region-response.dto").RegionResponseDto;
    }>;
    update(id: number, dto: UpdateRegionDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/region-response.dto").RegionResponseDto;
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/region-response.dto").RegionResponseDto;
    }>;
    restore(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/region-response.dto").RegionResponseDto;
    }>;
}
