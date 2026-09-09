import { GetDistrictsQueryDto } from './dto/get-districts-query.dto';
import { DistrictsService } from './districts.service';
export declare class DistrictsController {
    private readonly districtsService;
    constructor(districtsService: DistrictsService);
    findAll(query: GetDistrictsQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/district-response.dto").DistrictResponseDto>;
    }>;
}
