import type { GalleryImageResponseDto } from './gallery-image-response.dto';

export class GalleryResponseDto {
  id: number;
  uuid: string;
  organizationId: number;
  titleEnglish: string;
  titleHindi: string | null;
  descriptionEnglish: string | null;
  descriptionHindi: string | null;
  display_order: number;
  isActive: boolean;
  isDefault: boolean;
  imageCount: number;
  images?: GalleryImageResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
