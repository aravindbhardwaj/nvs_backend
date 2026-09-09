import { RefreshToken, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';
import { RefreshTokenRepositoryService } from './refresh-token.repository.service';
import { PrismaService } from '../../prisma/prisma.service';
export interface ValidatedRefreshToken {
    token: RefreshToken;
    user: User & {
        organizationType: {
            code: string;
        };
    };
}
export declare class RefreshTokenService {
    private readonly prisma;
    private readonly configService;
    private readonly passwordService;
    private readonly refreshTokenRepository;
    constructor(prisma: PrismaService, configService: ConfigService, passwordService: PasswordService, refreshTokenRepository: RefreshTokenRepositoryService);
    issue(userId: number): Promise<string>;
    validate(refreshToken: string): Promise<ValidatedRefreshToken>;
    rotate(validatedToken: ValidatedRefreshToken): Promise<string>;
    revoke(refreshToken: string, userId: number): Promise<void>;
    cleanupExpiredTokens(): Promise<void>;
    private findMatchingToken;
    private isUserActive;
    private getExpiryDate;
    private createAuditLog;
}
