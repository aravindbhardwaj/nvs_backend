export declare const JNV_PRINCIPAL_UPLOADS_ROOT: string;
export declare function validateJnvPrincipalFile(file: Express.Multer.File): void;
export declare function validateJnvPrincipalImage(file: Express.Multer.File): Promise<void>;
export declare const jnvPrincipalStorage: import("multer").StorageEngine;
