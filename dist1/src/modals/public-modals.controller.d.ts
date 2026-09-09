import { GetPublicModalsQueryDto } from './dto/get-public-modals-query.dto';
import { ModalsService } from './modals.service';
export declare class PublicModalsController {
    private readonly modals;
    constructor(modals: ModalsService);
    findAll(query: GetPublicModalsQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/modal-response.dto").PublicModalResponseDto>;
    }>;
}
