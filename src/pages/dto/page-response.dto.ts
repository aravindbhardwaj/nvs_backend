import { PageStatus } from '@prisma/client';

export class PageResponseDto {
  id: number;
  uuid: string;
  organizationId: number;
  contentTypeId: number;
  titleEnglish: string;
  titleHindi: string | null;
  slug: string;
  shortDescriptionEnglish: string | null;
  shortDescriptionHindi: string | null;
  contentEnglish: string;
  contentHindi: string | null;
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
  status: PageStatus;
  display_order: number;
  publishedAt: Date | null;
  start_date: string | null;
  end_date: string | null;
  createdAt: Date;
  updatedAt: Date;
}
