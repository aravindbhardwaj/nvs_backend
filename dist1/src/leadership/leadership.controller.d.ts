import type { Response } from 'express';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateLeaderDto } from './dto/create-leader.dto';
import { GetLeadersQueryDto } from './dto/get-leaders-query.dto';
import { ReorderLeadersDto } from './dto/reorder-leaders.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import { LeadershipService } from './leadership.service';
export declare class LeadershipController {
    private readonly leadership;
    constructor(leadership: LeadershipService);
    create(dto: CreateLeaderDto, file: Express.Multer.File | undefined, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/leader-response.dto").LeaderResponseDto;
    }>;
    findAll(query: GetLeadersQueryDto): Promise<{
        message: string;
        data: {
            items: import("./dto/leader-response.dto").LeaderResponseDto[];
            pagination: {
                page: number;
                limit: number;
                totalItems: number;
                totalPages: number;
            };
        };
    }>;
    image(id: number, response: Response): Promise<void>;
    findOne(id: number): Promise<{
        message: string;
        data: import("./dto/leader-response.dto").LeaderResponseDto;
    }>;
    reorder(dto: ReorderLeadersDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: null;
    }>;
    update(id: number, dto: UpdateLeaderDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/leader-response.dto").LeaderResponseDto;
    }>;
    replaceImage(id: number, file: Express.Multer.File | undefined, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/leader-response.dto").LeaderResponseDto;
    }>;
    activate(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/leader-response.dto").LeaderResponseDto;
    }>;
    deactivate(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/leader-response.dto").LeaderResponseDto;
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/leader-response.dto").LeaderResponseDto;
    }>;
}
