import { UserStatus } from '@prisma/client';

export class UserOrganizationReferenceDto {
  id: number;
  name: string;
  code: string;
}

export class UserOrganizationTypeReferenceDto {
  id: number;
  code: string;
  name: string;
}

export class UserResponseDto {
  id: number;
  name: string;
  username: string | null;
  email: string;
  mobile: string | null;
  address: string | null;
  organizationId: number;
  organization_type_id: number;
  organization: UserOrganizationReferenceDto;
  organization_type: UserOrganizationTypeReferenceDto;
  status: UserStatus;
  lastLoginAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
