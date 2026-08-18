export class BannerResponseDto {
  id: number;
  organizationId: number;
  titleEnglish: string;
  titleHindi: string | null;
  descriptionEnglish: string | null;
  descriptionHindi: string | null;
  altTextEnglish: string | null;
  altTextHindi: string | null;
  imageUrl: string;
  mimeType: string;
  extension: string;
  fileSize: string;
  displayOrder: number;
  isActive: boolean;
  visible_to_all: boolean | null;
  start_date: string | null;
  end_date: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export class PublicBannerResponseDto {
  id: number;
  title_english: string;
  title_hindi: string | null;
  description_english: string | null;
  description_hindi: string | null;
  alt_text_english: string | null;
  alt_text_hindi: string | null;
  image_url: string;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
}
