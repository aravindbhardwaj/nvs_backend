export type DistrictSeed = {
    id: number;
    districtName: string;
    districtCode: string;
    stateId: number;
    isActive: boolean;
    languageId: number | null;
    oldDistrictCode: string | null;
    oldDistrictName: string | null;
    roId: number | null;
};
export declare function readDistrictSeeds(csv: string): DistrictSeed[];
export declare const DISTRICTS: DistrictSeed[];
