"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationResponseDto = exports.OrganizationTypeReferenceDto = exports.OrganizationReferenceDto = void 0;
class OrganizationReferenceDto {
    id;
    name;
}
exports.OrganizationReferenceDto = OrganizationReferenceDto;
class OrganizationTypeReferenceDto {
    id;
    code;
    name;
}
exports.OrganizationTypeReferenceDto = OrganizationTypeReferenceDto;
class OrganizationResponseDto {
    id;
    organizationName;
    organizationHindiName;
    organizationCode;
    organizationTypeId;
    organizationType;
    parentOrganizationId;
    regionId;
    stateId;
    districtId;
    estdYear;
    studentsCount;
    address;
    addressHindi;
    isFunctional;
    parentOrganization;
    region;
    state;
    district;
    isDeleted;
    createdAt;
    updatedAt;
}
exports.OrganizationResponseDto = OrganizationResponseDto;
//# sourceMappingURL=organization-response.dto.js.map