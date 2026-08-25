import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class LeaderOrderDto {
  @Type(() => Number) @IsInt() @Min(1) id: number;
  @Type(() => Number) @IsInt() @Min(0) display_order: number;
}

export class ReorderLeadersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LeaderOrderDto)
  items: LeaderOrderDto[];
}
