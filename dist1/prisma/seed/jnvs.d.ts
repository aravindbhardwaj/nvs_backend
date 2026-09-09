export type JnvSeed = {
    organizationCode: string;
    organizationName: string;
    parentOrganizationCode: string;
    regionCode: string | null;
    stateCode: string;
    address: string | null;
    organizationHindiName: string | null;
    districtId: number;
    estdYear: number | null;
    studentsCount: number | null;
    schoolUrl: string;
};
export declare function readJnvSeeds(csv: string): JnvSeed[];
export declare const JNVS: JnvSeed[];
