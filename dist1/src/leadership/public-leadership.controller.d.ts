import type { Response } from 'express';
import { LeadershipService } from './leadership.service';
export declare class PublicLeadershipController {
    private readonly leadership;
    constructor(leadership: LeadershipService);
    findAll(): Promise<{
        message: string;
        data: import("./dto/leader-response.dto").PublicLeaderResponseDto[];
    }>;
    image(id: number, response: Response): Promise<void>;
    findOne(id: number): Promise<{
        message: string;
        data: import("./dto/leader-response.dto").PublicLeaderResponseDto;
    }>;
}
