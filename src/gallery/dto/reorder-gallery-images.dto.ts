import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { MAX_GALLERY_UPLOAD_COUNT } from '../gallery.constants';

class GalleryImageOrderDto {
  @Type(() => Number) @IsInt() @Min(1) id: number;
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
