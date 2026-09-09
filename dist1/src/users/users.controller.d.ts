import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/user-response.dto").UserResponseDto;
    }>;
    findAll(query: GetUsersQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/user-response.dto").UserResponseDto>;
    }>;
    findOne(id: number): Promise<{
        message: string;
        data: import("./dto/user-response.dto").UserResponseDto;
    }>;
    update(id: number, dto: UpdateUserDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/user-response.dto").UserResponseDto;
    }>;
    activate(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/user-response.dto").UserResponseDto;
    }>;
    deactivate(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/user-response.dto").UserResponseDto;
    }>;
    resetPassword(id: number, dto: ResetUserPasswordDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/user-response.dto").UserResponseDto;
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/user-response.dto").UserResponseDto;
    }>;
    restore(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/user-response.dto").UserResponseDto;
    }>;
}
