import type { Response } from 'express';
import { JnvPrincipalsService } from './jnv-principals.service';
export declare class PublicJnvPrincipalsController {
    private readonly principals;
    constructor(principals: JnvPrincipalsService);
    current(organizationId: number): Promise<{
        message: string;
        data: {
            id: number;
            organization_id: number;
            principal_name_english: string;
            principal_name_hindi: string | null;
            principal_designation_english: string | null;
            principal_designation_hindi: string | null;
            email: string | null;
            mobile: string | null;
            message_english: string | null;
            message_hindi: string | null;
            picture_url: string | null;
            joined_at: Date;
            relieved_at: Date | null;
            display_order: number;
        };
    }>;
    history(organizationId: number): Promise<{
        message: string;
        data: {
            id: number;
            organization_id: number;
            principal_name_english: string;
            principal_name_hindi: string | null;
            principal_designation_english: string | null;
            principal_designation_hindi: string | null;
            email: string | null;
            mobile: string | null;
            message_english: string | null;
            message_hindi: string | null;
            picture_url: string | null;
            joined_at: Date;
            relieved_at: Date | null;
            display_order: number;
        }[];
    }>;
    image(organizationId: number, id: number, response: Response): Promise<void>;
}
