import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateRegionDto {
  @ValidateIf((dto: CreateRegionDto) => dto.state_uuids === undefined)
  @IsDefined()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  regionName: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  regionNameHi?: string | null;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  regionCode: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  dcRoName?: string | null;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  dcRoNameHi?: string | null;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  state_ids?: string;

  @ValidateIf((dto: CreateRegionDto) => dto.state_ids === undefined)
  @IsDefined()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  state_uuids?: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  address?: string | null;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  addressHindi?: string | null;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  phone?: string | null;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  email?: string | null;
}
