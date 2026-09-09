import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { ReplaceUserPermissionsDto } from './dto/replace-user-permissions.dto';
import { UserPermissionsResponseDto } from './dto/user-permissions-response.dto';
export declare class UserPermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByUser(userId: number): Promise<UserPermissionsResponseDto>;
    replace(userId: number, dto: ReplaceUserPermissionsDto, actor: AuthenticatedUser): Promise<UserPermissionsResponseDto>;
    remove(userId: number, actor: AuthenticatedUser): Promise<UserPermissionsResponseDto>;
    private ensureUserExists;
    private ensurePermissionsExist;
    private findOverrides;
    private ensureActorIsNotTarget;
    private toResponse;
    private toAuditValues;
}
