export declare const SAFE_MODAL_LINK: RegExp;
export declare const SAFE_MODAL_LINK_MESSAGE = "link must be an HTTPS URL or an internal path beginning with /.";
export declare class CreateModalDto {
    text_english: string;
    text_hindi: string;
    link: string;
    display_order?: number;
    isActive?: boolean;
    start_date?: string;
    end_date?: string;
}
