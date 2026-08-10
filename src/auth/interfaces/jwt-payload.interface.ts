import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: number;
  organizationId: number;
  role: Role;
}
