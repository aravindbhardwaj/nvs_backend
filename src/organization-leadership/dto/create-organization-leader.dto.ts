import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { OrganizationReferenceDto } from './organization-reference.dto';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const boolean = ({ value }: { value: unknown }) =>
  value === undefined ? undefined : value === true || value === 'true';

export class CreateOrganizationLeaderDto extends OrganizationReferenceDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  leaderNameEnglish: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  leaderNameHindi?: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  leaderDesignationEnglish: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  leaderDesignationHindi?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  messageEnglish?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  messageHindi?: string;

  @IsOptional()
  @Transform(boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(boolean)
  @IsBoolean()
  visible_to_all?: boolean;
}
