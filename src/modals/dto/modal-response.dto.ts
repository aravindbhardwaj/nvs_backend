export class ModalResponseDto {
  id: number;
  text_english: string;
  text_hindi: string;
  link: string;
  display_order: number;
  isActive: boolean;
  start_date: string | null;
  end_date: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export class PublicModalResponseDto {
  id: number;
  text_english: string;
  text_hindi: string;
  link: string;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
}
