import { GetStatesQueryDto } from './dto/get-states-query.dto';
import { StatesService } from './states.service';
export declare class StatesController {
    private readonly statesService;
    constructor(statesService: StatesService);
    findAll(query: GetStatesQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/state-response.dto").StateResponseDto>;
    }>;
}
