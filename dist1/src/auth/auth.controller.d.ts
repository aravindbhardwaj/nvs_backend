import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        message: string;
        data: import("./dto/auth-response.dto").AuthResponseDto;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        message: string;
        data: import("./dto/token-refresh-response.dto").TokenRefreshResponseDto;
    }>;
    logout(dto: RefreshTokenDto, user: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
