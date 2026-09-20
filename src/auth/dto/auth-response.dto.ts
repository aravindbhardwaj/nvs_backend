import { Role } from '@prisma/client';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    uuid: string;
    name: string;
    email: string;
    role: Role;
    organizationId: number;
    organizationUuid: string;
    organization_type_id: number;
    organization_type: string;
  };
}
