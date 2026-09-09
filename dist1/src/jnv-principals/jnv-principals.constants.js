"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_JNV_PRINCIPAL_IMAGE_SIZE = exports.ALLOWED_JNV_PRINCIPAL_IMAGE_TYPES = void 0;
require("dotenv/config");
exports.ALLOWED_JNV_PRINCIPAL_IMAGE_TYPES = {
    jpg: ['image/jpeg', 'image/jpg', 'application/octet-stream'],
    jpeg: ['image/jpeg', 'image/jpg', 'application/octet-stream'],
    png: ['image/png', 'image/x-png', 'application/octet-stream'],
    webp: ['image/webp'],
};
const configuredSize = Number(process.env.JNV_PRINCIPAL_MAX_UPLOAD_SIZE);
exports.MAX_JNV_PRINCIPAL_IMAGE_SIZE = Number.isSafeInteger(configuredSize) && configuredSize > 0
    ? configuredSize
    : 5 * 1024 * 1024;
//# sourceMappingURL=jnv-principals.constants.js.map