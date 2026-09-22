import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateOrganizationProfileDto {
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  short_description?: string | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  short_description_hi?: string | null;
}
