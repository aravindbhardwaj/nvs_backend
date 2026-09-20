export class ContentTypeResponseDto {
  id: number;
  uuid: string;
  nameEnglish: string;
  nameHindi: string | null;
  descriptionEnglish: string | null;
  descriptionHindi: string | null;
  display_order: number;
  createdAt: Date;
  updatedAt: Date;
}
