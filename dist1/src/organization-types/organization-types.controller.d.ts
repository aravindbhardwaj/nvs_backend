import { OrganizationTypesService } from './organization-types.service';
export declare class OrganizationTypesController {
    private readonly organizationTypesService;
    constructor(organizationTypesService: OrganizationTypesService);
    findAll(): Promise<{
        message: string;
        data: {
            id: number;
            name: string;
            code: string;
        }[];
    }>;
}
