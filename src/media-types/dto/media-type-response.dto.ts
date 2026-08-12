export class MediaTypeResponseDto {
  id: number;
  nameEnglish: string;
  nameHindi: string | null;
  descriptionEnglish: string | null;
  descriptionHindi: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
