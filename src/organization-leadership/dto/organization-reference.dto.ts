import { Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class OrganizationReferenceDto {
  @Transform(trim)
  @IsUUID()
  organization_uuid: string;

  @IsOptional()
  @Transform(trim)
  @IsUUID()
  leadership_uuid?: string;
}
