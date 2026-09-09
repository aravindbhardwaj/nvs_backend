import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModalDto } from './dto/create-modal.dto';
import { GetModalsQueryDto } from './dto/get-modals-query.dto';
import { GetPublicModalsQueryDto } from './dto/get-public-modals-query.dto';
import { ModalResponseDto, PublicModalResponseDto } from './dto/modal-response.dto';
import { ReorderModalsDto } from './dto/reorder-modals.dto';
import { UpdateModalDto } from './dto/update-modal.dto';
export declare class ModalsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateModalDto, actor: AuthenticatedUser): Promise<ModalResponseDto>;
    findAll(query: GetModalsQueryDto): Promise<PaginatedResponseDto<ModalResponseDto>>;
    findOne(id: number): Promise<ModalResponseDto>;
    update(id: number, dto: UpdateModalDto, actor: AuthenticatedUser): Promise<ModalResponseDto>;
    setActive(id: number, isActive: boolean, actor: AuthenticatedUser): Promise<ModalResponseDto>;
    reorder(dto: ReorderModalsDto, actor: AuthenticatedUser): Promise<void>;
    remove(id: number, actor: AuthenticatedUser): Promise<ModalResponseDto>;
    findPublic(query: GetPublicModalsQueryDto): Promise<PaginatedResponseDto<PublicModalResponseDto>>;
    private findExisting;
    private createAuditLog;
    private toResponse;
    private toPublicResponse;
    private toAuditValues;
    private sortField;
    private assertDisplayDates;
}
