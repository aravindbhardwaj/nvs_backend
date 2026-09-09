import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { GetOrganizationsQueryDto } from './dto/get-organizations-query.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';
export declare class OrganizationsController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationsService);
    create(dto: CreateOrganizationDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/organization-response.dto").OrganizationResponseDto;
    }>;
    findAll(query: GetOrganizationsQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/organization-response.dto").OrganizationResponseDto>;
    }>;
    findMaster(query: GetOrganizationsQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<{
            id: number;
            name: string;
            organizationTypeId: number;
        }>;
    }>;
    findOne(id: number): Promise<{
        message: string;
        data: import("./dto/organization-response.dto").OrganizationResponseDto;
    }>;
    update(id: number, dto: UpdateOrganizationDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/organization-response.dto").OrganizationResponseDto;
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/organization-response.dto").OrganizationResponseDto;
    }>;
    restore(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/organization-response.dto").OrganizationResponseDto;
    }>;
}
