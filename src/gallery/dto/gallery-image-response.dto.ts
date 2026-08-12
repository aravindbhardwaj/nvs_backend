export class GalleryImageResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export class PublicGalleryImageResponseDto {
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
  createdAt: Date;
}
