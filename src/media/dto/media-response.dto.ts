export class MediaResponseDto {
  id: number;
  organizationId: number;
  mediaTypeId: number;
  title: string;
  description: string | null;
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
