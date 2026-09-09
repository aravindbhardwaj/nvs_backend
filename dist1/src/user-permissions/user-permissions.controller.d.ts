import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ReplaceUserPermissionsDto } from './dto/replace-user-permissions.dto';
import { UserPermissionsService } from './user-permissions.service';
export declare class UserPermissionsController {
    private readonly userPermissionsService;
    constructor(userPermissionsService: UserPermissionsService);
    findByUser(userId: number): Promise<{
        message: string;
        data: import("./dto/user-permissions-response.dto").UserPermissionsResponseDto;
    }>;
    replace(userId: number, dto: ReplaceUserPermissionsDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/user-permissions-response.dto").UserPermissionsResponseDto;
    }>;
    remove(userId: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/user-permissions-response.dto").UserPermissionsResponseDto;
    }>;
}
