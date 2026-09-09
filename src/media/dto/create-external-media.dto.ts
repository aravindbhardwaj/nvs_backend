import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

import { UploadMediaDto } from './upload-media.dto';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateExternalMediaDto extends UploadMediaDto {
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  externalUrl: string;
}
