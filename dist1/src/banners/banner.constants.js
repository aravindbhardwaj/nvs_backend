"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_BANNER_UPLOAD_SIZE = exports.ALLOWED_BANNER_TYPES = void 0;
require("dotenv/config");
exports.ALLOWED_BANNER_TYPES = {
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
    png: ['image/png'],
    webp: ['image/webp'],
};
const configuredUploadSize = Number(process.env.BANNER_MAX_UPLOAD_SIZE);
exports.MAX_BANNER_UPLOAD_SIZE = Number.isSafeInteger(configuredUploadSize) && configuredUploadSize > 0
    ? configuredUploadSize
    : 5 * 1024 * 1024;
//# sourceMappingURL=banner.constants.js.map