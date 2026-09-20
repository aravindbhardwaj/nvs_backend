export class PublicPageResponseDto {
  id: number;
  uuid: string;
  content_type_id: number;
  title_english: string;
  title_hindi: string | null;
  slug: string;
  short_description_english: string | null;
  short_description_hindi: string | null;
  content_english: string;
  content_hindi: string | null;
  section1_label_en: string | null;
  section1_label_hi: string | null;
  section2_label_en: string | null;
  section2_label_hi: string | null;
  content2_english: string | null;
  content2_hindi: string | null;
  section3_label_en: string | null;
  section3_label_hi: string | null;
  content3_english: string | null;
  content3_hindi: string | null;
  section4_label_en: string | null;
  section4_label_hi: string | null;
  content4_english: string | null;
  content4_hindi: string | null;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
}
