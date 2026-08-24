export class PublicMediaResponseDto {
  id: number;
  media_type_id: number;
  title_english: string;
  title_hindi: string | null;
  description_english: string | null;
  description_hindi: string | null;
  is_new: boolean | null;
  start_date: string | null;
  end_date: string | null;
  download_url: string;
  hindi_download_url: string | null;
}
