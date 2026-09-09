import { PageStatus } from '@prisma/client';
export declare class CreatePageDto {
    organizationId: number;
    contentTypeId: number;
    titleEnglish: string;
    titleHindi: string;
    shortDescriptionEnglish?: string;
    shortDescriptionHindi?: string;
    contentEnglish: string;
    contentHindi: string;
    status?: PageStatus;
    start_date?: string | null;
    end_date?: string | null;
    display_order?: number;
}
