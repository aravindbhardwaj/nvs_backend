import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateOfficerDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId?: number;

  @IsOptional()
  @IsUUID()
  organizationUuid?: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  officerName!: string;
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  officerName_hi!: string;
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  designation!: string;
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  designation_hi!: string;
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  phone!: string;
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  email!: string;
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  retirementDate?: string | null;
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  displayOrder?: number;
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateOfficerDto {
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  officerName?: string;
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  officerName_hi?: string;
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  designation?: string;
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  designation_hi?: string;
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  phone?: string;
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  email?: string;
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  retirementDate?: string | null;
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  displayOrder?: number;
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}

export class GetOfficersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId?: number;

  @IsOptional()
  @IsUUID()
  organizationUuid?: string;
}

export class GetPublicOfficersQueryDto {
  @IsUUID()
  organization_uuid!: string;
}
