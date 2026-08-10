import { PageStatus } from '@prisma/client';

export class PageResponseDto {
  id: number;
  organizationId: number;
  contentTypeId: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  content: string;
  status: PageStatus;
  displayOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
