export declare const GALLERY_UPLOADS_ROOT: string;
export declare function validateGalleryFile(file: Express.Multer.File): void;
export declare function validateGalleryImage(file: Express.Multer.File): Promise<void>;
export declare const galleryStorage: import("multer").StorageEngine;
