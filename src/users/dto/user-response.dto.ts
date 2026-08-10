import { Role, UserStatus } from '@prisma/client';

export class UserOrganizationReferenceDto {
  id: number;
  name: string;
  code: string;
}

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  address: string | null;
  role: Role;
  organizationId: number;
  organization: UserOrganizationReferenceDto;
  status: UserStatus;
  lastLoginAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
