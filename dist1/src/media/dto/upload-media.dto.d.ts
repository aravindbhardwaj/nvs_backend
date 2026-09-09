export declare class UploadMediaDto {
    organizationId?: number;
    titleEnglish: string;
    titleHindi: string;
    descriptionEnglish?: string;
    descriptionHindi?: string;
    mediaTypeId: number;
    sharedMediaTypeIds?: string | null;
    display_order?: number;
    is_active?: boolean;
    is_new?: boolean | null;
    visible_to_all?: boolean;
    ro_ids?: string | null;
    jnv_ids?: string | null;
    important_link_1?: boolean | null;
    important_link_2?: boolean | null;
    important_link_3?: boolean | null;
    start_date?: string;
    end_date?: string;
}
