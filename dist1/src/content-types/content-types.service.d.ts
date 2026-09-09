import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { ContentTypeResponseDto } from './dto/content-type-response.dto';
import { GetContentTypesQueryDto } from './dto/get-content-types-query.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
export declare class ContentTypesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateContentTypeDto, actor: AuthenticatedUser): Promise<ContentTypeResponseDto>;
    findAll(query: GetContentTypesQueryDto): Promise<PaginatedResponseDto<ContentTypeResponseDto>>;
    findOne(id: number): Promise<ContentTypeResponseDto>;
    update(id: number, dto: UpdateContentTypeDto, actor: AuthenticatedUser): Promise<ContentTypeResponseDto>;
    remove(id: number, actor: AuthenticatedUser): Promise<ContentTypeResponseDto>;
    restore(id: number, actor: AuthenticatedUser): Promise<ContentTypeResponseDto>;
    private findActiveContentType;
    private ensureNameIsUnique;
    private buildWhere;
    private toResponse;
    private toAuditValues;
}
