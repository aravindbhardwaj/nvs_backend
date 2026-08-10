import { Role } from '@prisma/client';

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
    organizationId: number;
  };
}
