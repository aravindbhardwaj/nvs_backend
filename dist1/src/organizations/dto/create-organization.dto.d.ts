export declare class CreateOrganizationDto {
    organizationName: string;
    organizationHindiName?: string;
    organizationCode: string;
    organizationTypeId: number;
    parentOrganizationId?: number;
    regionId?: number;
    stateId?: number;
    districtId?: number | null;
    estdYear?: number | null;
    studentsCount?: number | null;
    address?: string;
    addressHindi?: string;
    isFunctional?: boolean;
}
