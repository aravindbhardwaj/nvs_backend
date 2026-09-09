import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaderDto } from './dto/create-leader.dto';
import { GetLeadersQueryDto } from './dto/get-leaders-query.dto';
import { LeaderResponseDto, PublicLeaderResponseDto } from './dto/leader-response.dto';
import { ReorderLeadersDto } from './dto/reorder-leaders.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
export declare class LeadershipService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateLeaderDto, file: Express.Multer.File, actor: AuthenticatedUser): Promise<LeaderResponseDto>;
    findAll(query: GetLeadersQueryDto): Promise<{
        items: LeaderResponseDto[];
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<LeaderResponseDto>;
    update(id: number, dto: UpdateLeaderDto, actor: AuthenticatedUser): Promise<LeaderResponseDto>;
    replaceImage(id: number, file: Express.Multer.File, actor: AuthenticatedUser): Promise<LeaderResponseDto>;
    setActive(id: number, isActive: boolean, actor: AuthenticatedUser): Promise<LeaderResponseDto>;
    reorder(dto: ReorderLeadersDto, actor: AuthenticatedUser): Promise<void>;
    remove(id: number, actor: AuthenticatedUser): Promise<LeaderResponseDto>;
    findPublic(): Promise<PublicLeaderResponseDto[]>;
    findPublicOne(id: number): Promise<PublicLeaderResponseDto>;
    imageStream(id: number, publicOnly?: boolean): Promise<{
        stream: import("fs").ReadStream;
        mimeType: string;
    }>;
    cleanupUploadedFile(file: Express.Multer.File): Promise<void>;
    private findExisting;
    private relativePath;
    private absolutePath;
    private deleteStoredFile;
    private toResponse;
    private toPublicResponse;
}
