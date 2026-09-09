"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleFromOrganizationTypeCode = void 0;
const client_1 = require("@prisma/client");
const roleFromOrganizationTypeCode = (code) => {
    if (code === 'REGIONAL_OFFICE')
        return client_1.Role.REGIONAL;
    return code;
};
exports.roleFromOrganizationTypeCode = roleFromOrganizationTypeCode;
//# sourceMappingURL=organization-type-role.util.js.map