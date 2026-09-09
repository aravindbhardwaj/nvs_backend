import type { Response } from 'express';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateExternalMediaDto } from './dto/create-external-media.dto';
import { GetMediaQueryDto } from './dto/get-media-query.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    createExternal(dto: CreateExternalMediaDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/media-response.dto").MediaResponseDto;
    }>;
    upload(dto: UploadMediaDto, files: {
        file?: Express.Multer.File[];
        hindiFile?: Express.Multer.File[];
    }, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/media-response.dto").MediaResponseDto;
    }>;
    findAll(query: GetMediaQueryDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/media-response.dto").MediaResponseDto & {
            organization_name: string;
        }>;
    }>;
    download(id: number, user: AuthenticatedUser, response: Response): Promise<void>;
    downloadHindi(id: number, user: AuthenticatedUser, response: Response): Promise<void>;
    findOne(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/media-response.dto").MediaResponseDto;
    }>;
    replaceFile(id: number, files: {
        file?: Express.Multer.File[];
        hindiFile?: Express.Multer.File[];
    }, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/media-response.dto").MediaResponseDto;
    }>;
    update(id: number, dto: UpdateMediaDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/media-response.dto").MediaResponseDto;
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/media-response.dto").MediaResponseDto;
    }>;
    restore(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/media-response.dto").MediaResponseDto;
    }>;
}
