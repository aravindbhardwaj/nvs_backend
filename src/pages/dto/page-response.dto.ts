import { PageStatus } from '@prisma/client';

export class PageResponseDto {
  id: number;
  organizationId: number;
  contentTypeId: number;
  titleEnglish: string;
  titleHindi: string | null;
  slug: string;
  shortDescriptionEnglish: string | null;
  shortDescriptionHindi: string | null;
  contentEnglish: string;
  contentHindi: string | null;
  status: PageStatus;
  displayOrder: number;
  publishedAt: Date | null;
  start_date: string | null;
  end_date: string | null;
  createdAt: Date;
  updatedAt: Date;
}
