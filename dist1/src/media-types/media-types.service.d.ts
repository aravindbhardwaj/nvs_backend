import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaTypeDto } from './dto/create-media-type.dto';
import { GetMediaTypesQueryDto } from './dto/get-media-types-query.dto';
import { MediaTypeResponseDto } from './dto/media-type-response.dto';
import { UpdateMediaTypeDto } from './dto/update-media-type.dto';
export declare class MediaTypesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateMediaTypeDto, actor: AuthenticatedUser): Promise<MediaTypeResponseDto>;
    findAll(query: GetMediaTypesQueryDto): Promise<PaginatedResponseDto<MediaTypeResponseDto>>;
    findOne(id: number): Promise<MediaTypeResponseDto>;
    update(id: number, dto: UpdateMediaTypeDto, actor: AuthenticatedUser): Promise<MediaTypeResponseDto>;
    remove(id: number, actor: AuthenticatedUser): Promise<MediaTypeResponseDto>;
    restore(id: number, actor: AuthenticatedUser): Promise<MediaTypeResponseDto>;
    private findActiveMediaType;
    private ensureNameIsUnique;
    private buildWhere;
    private toResponse;
    private toAuditValues;
}
