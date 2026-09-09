"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_GALLERY_UPLOAD_COUNT = exports.MAX_GALLERY_UPLOAD_SIZE = exports.ALLOWED_GALLERY_TYPES = void 0;
require("dotenv/config");
exports.ALLOWED_GALLERY_TYPES = {
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
    png: ['image/png'],
    webp: ['image/webp'],
};
const configuredSize = Number(process.env.GALLERY_MAX_UPLOAD_SIZE);
const configuredCount = Number(process.env.GALLERY_MAX_UPLOAD_COUNT);
exports.MAX_GALLERY_UPLOAD_SIZE = Number.isSafeInteger(configuredSize) && configuredSize > 0
    ? configuredSize
    : 5 * 1024 * 1024;
exports.MAX_GALLERY_UPLOAD_COUNT = Number.isSafeInteger(configuredCount) && configuredCount > 0
    ? configuredCount
    : 10;
//# sourceMappingURL=gallery.constants.js.map