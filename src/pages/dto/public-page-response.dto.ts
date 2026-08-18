export class PublicPageResponseDto {
  id: number;
  content_type_id: number;
  title_english: string;
  title_hindi: string | null;
  slug: string;
  short_description_english: string | null;
  short_description_hindi: string | null;
  content_english: string;
  content_hindi: string | null;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
}
