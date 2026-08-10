import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PageStatus } from '@prisma/client';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreatePageDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  contentTypeId: number;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @Transform(trimValue)
  @IsString()
  shortDescription?: string;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;
}
