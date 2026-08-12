export class MediaResponseDto {
  id: number;
  organizationId: number;
  mediaTypeId: number;
  titleEnglish: string;
  titleHindi: string | null;
  descriptionEnglish: string | null;
  descriptionHindi: string | null;
  originalFilename: string;
  mimeType: string;
  extension: string;
  fileSize: string;
  checksum: string | null;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
