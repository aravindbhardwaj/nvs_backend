import { Prisma, RefreshToken } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class RefreshTokenRepositoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Prisma.PrismaPromise<({
        user: {
            organizationType: {
                code: string;
            };
        } & {
            id: number;
            address: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdById: number | null;
            updatedById: number | null;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: number | null;
            name: string;
            organizationTypeId: number;
            username: string | null;
            email: string;
            passwordHash: string;
            mobile: string | null;
            organizationId: number;
            status: import("@prisma/client").$Enums.UserStatus;
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            sessionVersion: number;
            passwordResetRequired: boolean;
            passwordChangedAt: Date | null;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        tokenHash: string;
        expiresAt: Date;
        revokedAt: Date | null;
    })[]>;
    create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken>;
    revoke(id: number, revokedAt: Date): Promise<boolean>;
    cleanupExpired(now: Date): Promise<Prisma.BatchPayload>;
}
