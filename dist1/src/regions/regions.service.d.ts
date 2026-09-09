import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { GetRegionsQueryDto } from './dto/get-regions-query.dto';
import { RegionResponseDto } from './dto/region-response.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
export declare class RegionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateRegionDto, actor: AuthenticatedUser): Promise<RegionResponseDto>;
    findAll(query: GetRegionsQueryDto): Promise<PaginatedResponseDto<RegionResponseDto>>;
    findOne(id: number): Promise<RegionResponseDto>;
    update(id: number, dto: UpdateRegionDto, actor: AuthenticatedUser): Promise<RegionResponseDto>;
    remove(id: number, actor: AuthenticatedUser): Promise<RegionResponseDto>;
    restore(id: number, actor: AuthenticatedUser): Promise<RegionResponseDto>;
    private findActiveRegion;
    private ensureValuesAreUnique;
    private buildWhere;
    private normalizeAndValidateStateIds;
    private toResponse;
    private toAuditValues;
}
