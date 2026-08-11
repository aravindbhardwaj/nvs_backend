export class GalleryImageResponseDto {
  id: number;
  organizationId: number;
  title: string;
  description: string | null;
  altText: string | null;
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
  title: string;
  description: string | null;
  altText: string | null;
  imageUrl: string;
  displayOrder: number;
  createdAt: Date;
}
