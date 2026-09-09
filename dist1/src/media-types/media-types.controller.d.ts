import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateMediaTypeDto } from './dto/create-media-type.dto';
import { GetMediaTypesQueryDto } from './dto/get-media-types-query.dto';
import { UpdateMediaTypeDto } from './dto/update-media-type.dto';
import { MediaTypesService } from './media-types.service';
export declare class MediaTypesController {
    private readonly mediaTypesService;
    constructor(mediaTypesService: MediaTypesService);
    create(dto: CreateMediaTypeDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/media-type-response.dto").MediaTypeResponseDto;
    }>;
    findAll(query: GetMediaTypesQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/media-type-response.dto").MediaTypeResponseDto>;
    }>;
    findOne(id: number): Promise<{
        message: string;
        data: import("./dto/media-type-response.dto").MediaTypeResponseDto;
    }>;
    update(id: number, dto: UpdateMediaTypeDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/media-type-response.dto").MediaTypeResponseDto;
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/media-type-response.dto").MediaTypeResponseDto;
    }>;
    restore(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/media-type-response.dto").MediaTypeResponseDto;
    }>;
}
