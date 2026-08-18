export class OrganizationReferenceDto {
  id: number;
  name: string;
}

export class OrganizationTypeReferenceDto {
  id: number;
  code: string;
  name: string;
}

export class OrganizationResponseDto {
  id: number;
  organizationName: string;
  organizationHindiName: string | null;
  organizationCode: string;
  organizationTypeId: number;
  organizationType: OrganizationTypeReferenceDto;
  parentOrganizationId: number | null;
  regionId: number | null;
  stateId: number | null;
  address: string | null;
  isFunctional: boolean;
  parentOrganization: OrganizationReferenceDto | null;
  region: OrganizationReferenceDto | null;
  state: OrganizationReferenceDto | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
