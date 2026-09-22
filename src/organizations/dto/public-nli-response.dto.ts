export class PublicNliResponseDto {
  uuid: string;
  url: string;
  name_en: string;
  name_hi: string | null;
  director_name_en: string | null;
  director_name_hi: string | null;
  address_en: string | null;
  address_hi: string | null;
  phone_number: string | null;
  email_address: string | null;
  short_description: string | null;
  short_description_hi: string | null;
  image_url: string | null;
}
