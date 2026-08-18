export class DistrictResponseDto {
  id: number;
  districtName: string;
  nameHi: string | null;
  districtCode: string;
  stateId: number;
  isActive: boolean;
  languageId: number | null;
  oldDistrictCode: string | null;
  oldDistrictName: string | null;
  roId: number | null;
  createdAt: Date;
  updatedAt: Date;
}
