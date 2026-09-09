export type OrganizationOwnedResource = 'page' | 'media' | 'banner' | 'galleryImage';
export declare const ORGANIZATION_OWNED_RESOURCE_KEY = "organization_owned_resource";
export declare const OrganizationOwned: (resource: OrganizationOwnedResource) => import("@nestjs/common").CustomDecorator<string>;
