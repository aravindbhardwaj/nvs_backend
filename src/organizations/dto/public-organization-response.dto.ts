export class PublicOrganizationResponseDto {
  id: number;
  uuid: string;
  url: string;
  name: string;
  nameHi: string | null;
  code: string;
  address: string | null;
  address_hindi: string | null;
  region: string | null;
  regionHi: string | null;
  dcRoName: string | null;
  dcRoNameHi: string | null;
  regionAddress: string | null;
  regionAddressHindi: string | null;
  regionPhone: string | null;
  regionEmail: string | null;
  stateNames: string | null;
  stateNamesHi: string | null;
  short_description: string | null;
  short_description_hi: string | null;
  image_url: string | null;
}
