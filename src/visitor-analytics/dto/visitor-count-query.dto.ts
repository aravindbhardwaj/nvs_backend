import { Type } from 'class-transformer';
import { IsDefined, IsInt, IsUUID, Min, ValidateIf } from 'class-validator';

export class VisitorCountQueryDto {
  @ValidateIf(
    (dto: VisitorCountQueryDto) => dto.organization_uuid === undefined,
  )
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organization_id?: number;
  @ValidateIf((dto: VisitorCountQueryDto) => dto.organization_id === undefined)
  @IsDefined()
  @IsUUID()
  organization_uuid?: string;
}
