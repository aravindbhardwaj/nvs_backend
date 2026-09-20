export class OrganizationReferenceDto {
  id: number;
  uuid: string;
  name: string;
}

export class OrganizationTypeReferenceDto {
  id: number;
  uuid: string;
  code: string;
  name: string;
}

export class OrganizationResponseDto {
  id: number;
  uuid: string;
  organizationName: string;
  organizationHindiName: string | null;
  organization_name_en: string | null;
  organization_name_hi: string | null;
  organizationCode: string;
  organizationTypeId: number;
  organizationType: OrganizationTypeReferenceDto;
  parentOrganizationId: number | null;
  regionId: number | null;
  stateId: number | null;
  districtId: number | null;
  estdYear: number | null;
  studentsCount: number | null;
  address: string | null;
  addressHindi: string | null;
  director_name_en: string | null;
  director_name_hi: string | null;
  phone_number: string | null;
  email_address: string | null;
  short_description: string | null;
  image_url: string | null;
  isFunctional: boolean;
  parentOrganization: OrganizationReferenceDto | null;
  region: OrganizationReferenceDto | null;
  state: OrganizationReferenceDto | null;
  district: OrganizationReferenceDto | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
