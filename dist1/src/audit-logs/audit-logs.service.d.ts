import { Prisma } from '@prisma/client';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetAuditLogsQueryDto } from './dto/get-audit-logs-query.dto';
export interface CreateAuditLogInput {
    userId: number;
    module: string;
    entity: string;
    entityId?: number | null;
    action: string;
    previousValues?: Prisma.InputJsonValue;
    newValues?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditLogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(input: CreateAuditLogInput): Promise<void>;
    findAll(query: GetAuditLogsQueryDto): Promise<PaginatedResponseDto<unknown>>;
    findOne(id: number): Promise<{
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
        previousValues: Prisma.JsonValue | null;
        newValues: Prisma.JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
}
