import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
export declare class OrganizationOwnershipService {
    assertAccess(organizationId: number, user: AuthenticatedUser): void;
}
