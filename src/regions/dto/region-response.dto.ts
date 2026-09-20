export class RegionResponseDto {
  id: number;
  uuid: string;
  regionName: string;
  regionNameHi: string | null;
  regionCode: string;
  dcRoName: string | null;
  dcRoNameHi: string | null;
  state_ids: string | null;
  address: string | null;
  addressHindi: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}
