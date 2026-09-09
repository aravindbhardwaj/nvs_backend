"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicBannerResponseDto = exports.BannerResponseDto = void 0;
class BannerResponseDto {
    id;
    organizationId;
    titleEnglish;
    titleHindi;
    descriptionEnglish;
    descriptionHindi;
    altTextEnglish;
    altTextHindi;
    link_url;
    imageUrl;
    mimeType;
    extension;
    fileSize;
    display_order;
    isActive;
    visible_to_all;
    start_date;
    end_date;
    createdAt;
    updatedAt;
    isDeleted;
}
exports.BannerResponseDto = BannerResponseDto;
class PublicBannerResponseDto {
    id;
    title_english;
    title_hindi;
    description_english;
    description_hindi;
    alt_text_english;
    alt_text_hindi;
    link_url;
    image_url;
    display_order;
    start_date;
    end_date;
}
exports.PublicBannerResponseDto = PublicBannerResponseDto;
//# sourceMappingURL=banner-response.dto.js.map