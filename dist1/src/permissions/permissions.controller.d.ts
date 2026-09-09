import { GetPermissionsQueryDto } from './dto/get-permissions-query.dto';
import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findAll(query: GetPermissionsQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/permission-response.dto").PermissionResponseDto>;
    }>;
    findOne(id: number): Promise<{
        message: string;
        data: import("./dto/permission-response.dto").PermissionResponseDto;
    }>;
}
