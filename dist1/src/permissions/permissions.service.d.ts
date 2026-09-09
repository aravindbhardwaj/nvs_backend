import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetPermissionsQueryDto } from './dto/get-permissions-query.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: GetPermissionsQueryDto): Promise<PaginatedResponseDto<PermissionResponseDto>>;
    findOne(id: number): Promise<PermissionResponseDto>;
    private buildWhere;
    private toResponse;
}
