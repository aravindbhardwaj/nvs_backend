import { GetPublicJnvsQueryDto } from './dto/get-public-jnvs-query.dto';
import { OrganizationsService } from './organizations.service';
export declare class PublicJnvsController {
    private readonly organizations;
    constructor(organizations: OrganizationsService);
    stateMap(): Promise<{
        message: string;
        data: Record<string, [string, number, string]>;
    }>;
    findAll(query: GetPublicJnvsQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/public-jnv-response.dto").PublicJnvResponseDto>;
    }>;
}
