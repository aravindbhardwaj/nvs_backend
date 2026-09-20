import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  IsOptional,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { MAX_GALLERY_UPLOAD_COUNT } from '../gallery.constants';

class GalleryImageOrderDto {
  @ValidateIf((dto: GalleryImageOrderDto) => dto.uuid === undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;
  @IsOptional() @IsUUID() uuid?: string;
  @Type(() => Number) @IsInt() display_order: number;
}

export class ReorderGalleryImagesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_GALLERY_UPLOAD_COUNT)
  @ValidateNested({ each: true })
  @Type(() => GalleryImageOrderDto)
  images: GalleryImageOrderDto[];
}
