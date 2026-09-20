import { Type } from 'class-transformer';
import {
  IsDefined,
  IsIn,
  IsInt,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

import { VISITOR_LANGUAGE_VALUES } from '../visitor-analytics.constants';

export class CaptureVisitDto {
  @ValidateIf((dto: CaptureVisitDto) => dto.organization_uuid === undefined)
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_id?: number;

  @ValidateIf((dto: CaptureVisitDto) => dto.organization_id === undefined)
  @IsDefined()
  @IsUUID()
  organization_uuid?: string;

  @IsUUID()
  visitor_id: string;

  @IsUUID()
  session_id: string;

  @Type(() => Number)
  @IsIn(VISITOR_LANGUAGE_VALUES)
  language: number;
}
