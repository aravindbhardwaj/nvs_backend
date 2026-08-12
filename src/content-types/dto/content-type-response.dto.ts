export class ContentTypeResponseDto {
  id: number;
  nameEnglish: string;
  nameHindi: string | null;
  descriptionEnglish: string | null;
  descriptionHindi: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
