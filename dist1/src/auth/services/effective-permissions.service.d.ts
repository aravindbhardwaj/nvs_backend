import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class EffectivePermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    resolve(userId: number, role: Role): Promise<Set<string>>;
}
