import { SetMetadata } from '@nestjs/common';

export type OrganizationOwnedResource = 'page' | 'media' | 'banner';

export const ORGANIZATION_OWNED_RESOURCE_KEY = 'organization_owned_resource';

export const OrganizationOwned = (resource: OrganizationOwnedResource) =>
  SetMetadata(ORGANIZATION_OWNED_RESOURCE_KEY, resource);
