import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: number;
  organizationId: number;
  organizationTypeId: number;
  organizationType: string;
  role: Role;
  sessionVersion: number;
}
