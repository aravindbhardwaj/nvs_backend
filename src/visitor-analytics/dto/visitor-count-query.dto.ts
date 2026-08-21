import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class VisitorCountQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_id: number;
}
