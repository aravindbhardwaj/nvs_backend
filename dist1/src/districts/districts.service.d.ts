import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DistrictResponseDto } from './dto/district-response.dto';
import { GetDistrictsQueryDto } from './dto/get-districts-query.dto';
export declare class DistrictsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: GetDistrictsQueryDto): Promise<PaginatedResponseDto<DistrictResponseDto>>;
    private toResponse;
}
