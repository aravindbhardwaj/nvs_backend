import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetStatesQueryDto } from './dto/get-states-query.dto';
import { StateResponseDto } from './dto/state-response.dto';
export declare class StatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: GetStatesQueryDto): Promise<PaginatedResponseDto<StateResponseDto>>;
    private toResponse;
}
