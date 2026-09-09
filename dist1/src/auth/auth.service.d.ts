import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenRefreshResponseDto } from './dto/token-refresh-response.dto';
import { PasswordService } from './services/password.service';
import { RefreshTokenService } from './services/refresh-token.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly passwordService;
    private readonly refreshTokenService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, passwordService: PasswordService, refreshTokenService: RefreshTokenService);
    private findUserByEmail;
    private findUserByIdentifier;
    private ensureUserCanLogin;
    private recordFailedLogin;
    private resetFailedAttempts;
    private buildJwtPayload;
    private generateAccessToken;
    private createAuthenticationAuditLog;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<TokenRefreshResponseDto>;
    logout(dto: RefreshTokenDto, userId: number): Promise<void>;
}
