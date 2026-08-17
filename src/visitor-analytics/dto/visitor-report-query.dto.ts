import { IsDateString } from 'class-validator';

export class VisitorReportQueryDto {
  @IsDateString()
  from_date: string;

  @IsDateString()
  to_date: string;
}
