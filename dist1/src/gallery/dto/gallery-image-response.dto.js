"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicGalleryImageResponseDto = exports.GalleryImageResponseDto = void 0;
class GalleryImageResponseDto {
    id;
    organizationId;
    titleEnglish;
    titleHindi;
    descriptionEnglish;
    descriptionHindi;
    altTextEnglish;
    altTextHindi;
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
exports.GalleryImageResponseDto = GalleryImageResponseDto;
class PublicGalleryImageResponseDto {
    id;
    title_english;
    title_hindi;
    description_english;
    description_hindi;
    alt_text_english;
    alt_text_hindi;
    image_url;
    display_order;
    start_date;
    end_date;
}
exports.PublicGalleryImageResponseDto = PublicGalleryImageResponseDto;
//# sourceMappingURL=gallery-image-response.dto.js.map