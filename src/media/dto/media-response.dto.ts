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
  hindiOriginalFilename: string | null;
  hindiMimeType: string | null;
  hindiExtension: string | null;
  hindiFileSize: string | null;
  hindiChecksum: string | null;
  hindiDownloadUrl: string | null;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
