import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateModalDto } from './dto/create-modal.dto';
import { GetModalsQueryDto } from './dto/get-modals-query.dto';
import { ReorderModalsDto } from './dto/reorder-modals.dto';
import { UpdateModalDto } from './dto/update-modal.dto';
import { ModalsService } from './modals.service';
export declare class ModalsController {
    private readonly modals;
    constructor(modals: ModalsService);
    create(dto: CreateModalDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/modal-response.dto").ModalResponseDto;
    }>;
    findAll(query: GetModalsQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/modal-response.dto").ModalResponseDto>;
    }>;
    findOne(id: number): Promise<{
        message: string;
        data: import("./dto/modal-response.dto").ModalResponseDto;
    }>;
    reorder(dto: ReorderModalsDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: null;
    }>;
    update(id: number, dto: UpdateModalDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/modal-response.dto").ModalResponseDto;
    }>;
    activate(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/modal-response.dto").ModalResponseDto;
    }>;
    deactivate(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/modal-response.dto").ModalResponseDto;
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/modal-response.dto").ModalResponseDto;
    }>;
}
