"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = exports.UserOrganizationTypeReferenceDto = exports.UserOrganizationReferenceDto = void 0;
class UserOrganizationReferenceDto {
    id;
    name;
    code;
}
exports.UserOrganizationReferenceDto = UserOrganizationReferenceDto;
class UserOrganizationTypeReferenceDto {
    id;
    code;
    name;
}
exports.UserOrganizationTypeReferenceDto = UserOrganizationTypeReferenceDto;
class UserResponseDto {
    id;
    name;
    username;
    email;
    mobile;
    address;
    organizationId;
    organization_type_id;
    organization;
    organization_type;
    status;
    lastLoginAt;
    isDeleted;
    createdAt;
    updatedAt;
}
exports.UserResponseDto = UserResponseDto;
//# sourceMappingURL=user-response.dto.js.map