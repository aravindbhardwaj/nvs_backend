import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { MAX_GALLERY_UPLOAD_COUNT } from '../gallery.constants';

export class BulkDeleteGalleryImagesDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_GALLERY_UPLOAD_COUNT)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids: number[] = [];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_GALLERY_UPLOAD_COUNT)
  @IsUUID(undefined, { each: true })
  uuids?: string[];
}
