import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class VisitorReportQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_id?: number;
  @IsOptional() @IsUUID() organization_uuid?: string;

  @IsDateString()
  from_date: string;

  @IsDateString()
  to_date: string;
}
