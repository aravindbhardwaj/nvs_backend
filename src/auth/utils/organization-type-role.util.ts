import { Role } from '@prisma/client';

export const roleFromOrganizationTypeCode = (code: string): Role => {
  if (code === 'REGIONAL_OFFICE') return Role.REGIONAL;
  return code as Role;
};
