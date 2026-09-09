import { PrismaService } from '../prisma/prisma.service';
export declare class OrganizationTypesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        code: string;
    }[]>;
}
