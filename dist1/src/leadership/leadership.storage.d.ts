export declare const LEADERSHIP_UPLOADS_ROOT: string;
export declare function validateLeaderFile(file: Express.Multer.File): void;
export declare function validateLeaderImage(file: Express.Multer.File): Promise<void>;
export declare const leadershipStorage: import("multer").StorageEngine;
