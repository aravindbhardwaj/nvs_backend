import { Role } from '@prisma/client';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
    organizationId: number;
    organization_type_id: number;
    organization_type: string;
  };
}
