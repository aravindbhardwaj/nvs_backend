export class BannerResponseDto {
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
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export class PublicBannerResponseDto {
  id: number;
  organizationId: number;
  title: string;
  description: string | null;
  altText: string | null;
  imageUrl: string;
  displayOrder: number;
  startDate: Date | null;
  endDate: Date | null;
}
