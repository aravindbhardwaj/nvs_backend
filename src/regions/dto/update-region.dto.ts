import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateRegionDto {
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

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  state_ids?: string;

  @IsOptional()
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
