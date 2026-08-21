import { Type } from 'class-transformer';
import { IsIn, IsInt, IsUUID, Min } from 'class-validator';

import { VISITOR_LANGUAGE_VALUES } from '../visitor-analytics.constants';

export class CaptureVisitDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_id: number;

  @IsUUID()
  visitor_id: string;

  @IsUUID()
  session_id: string;

  @Type(() => Number)
  @IsIn(VISITOR_LANGUAGE_VALUES)
  language: number;
}
