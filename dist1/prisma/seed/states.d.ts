export type StateSeed = {
    id: number;
    stateName: string;
    stateCode: string;
    isActive: boolean;
    roId: number | null;
    isoCode: string;
};
export declare function readStateSeeds(csv: string): StateSeed[];
export declare const STATES: StateSeed[];
