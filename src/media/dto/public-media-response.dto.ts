import { SharedMediaPlacementDto } from './shared-media-placement.dto';

export class PublicMediaResponseDto {
  id: number;
  uuid: string;
  source_type: 'FILE' | 'EXTERNAL';
  external_url: string | null;
  media_type_id: number;
  media_type_name: string | null;
  shared_media_placements: SharedMediaPlacementDto[];
  title_english: string;
  title_hindi: string | null;
  description_english: string | null;
  description_hindi: string | null;
  is_new: boolean | null;
  start_date: string | null;
  end_date: string | null;
  download_url: string | null;
  hindi_download_url: string | null;
}
