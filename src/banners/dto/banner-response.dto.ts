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
  organizationId: number;
  titleEnglish: string;
  titleHindi: string | null;
  descriptionEnglish: string | null;
  descriptionHindi: string | null;
  altTextEnglish: string | null;
  altTextHindi: string | null;
  imageUrl: string;
  displayOrder: number;
  start_date: string | null;
  end_date: string | null;
}
