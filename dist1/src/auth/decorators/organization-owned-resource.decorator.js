"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationOwned = exports.ORGANIZATION_OWNED_RESOURCE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ORGANIZATION_OWNED_RESOURCE_KEY = 'organization_owned_resource';
const OrganizationOwned = (resource) => (0, common_1.SetMetadata)(exports.ORGANIZATION_OWNED_RESOURCE_KEY, resource);
exports.OrganizationOwned = OrganizationOwned;
//# sourceMappingURL=organization-owned-resource.decorator.js.map