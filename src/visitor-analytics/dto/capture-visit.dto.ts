import { Type } from 'class-transformer';
import { IsIn, IsUUID } from 'class-validator';

import { VISITOR_LANGUAGE_VALUES } from '../visitor-analytics.constants';

export class CaptureVisitDto {
  @IsUUID()
  visitor_id: string;

  @IsUUID()
  session_id: string;

  @Type(() => Number)
  @IsIn(VISITOR_LANGUAGE_VALUES)
  language: number;
}
