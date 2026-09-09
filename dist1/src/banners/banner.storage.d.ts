export declare const BANNER_UPLOADS_ROOT: string;
export declare function validateBannerFile(file: Express.Multer.File): void;
export declare function validateBannerImage(file: Express.Multer.File): Promise<void>;
export declare const bannerStorage: import("multer").StorageEngine;
