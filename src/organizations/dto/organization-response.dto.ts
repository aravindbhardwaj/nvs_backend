import { OrganizationType } from '@prisma/client';

export class OrganizationReferenceDto {
  id: number;
  name: string;
}

export class OrganizationResponseDto {
  id: number;
  organizationName: string;
  organizationCode: string;
  organizationType: OrganizationType;
  parentOrganizationId: number | null;
  regionId: number | null;
  stateId: number | null;
  address: string | null;
  parentOrganization: OrganizationReferenceDto | null;
  region: OrganizationReferenceDto | null;
  state: OrganizationReferenceDto | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
