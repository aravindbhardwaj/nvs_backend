import { GetAuditLogsQueryDto } from './dto/get-audit-logs-query.dto';
import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(query: GetAuditLogsQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<unknown>;
    }>;
    findOne(id: number): Promise<{
        message: string;
        data: {
            user: {
                id: number;
                name: string;
                email: string;
            };
        } & {
            id: number;
            createdAt: Date;
            module: string;
            action: string;
            userId: number;
            entity: string;
            entityId: number | null;
            previousValues: import("@prisma/client/runtime/library").JsonValue | null;
            newValues: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        };
    }>;
}
