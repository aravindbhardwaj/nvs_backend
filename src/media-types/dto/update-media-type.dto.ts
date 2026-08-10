import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateMediaTypeDto {
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
