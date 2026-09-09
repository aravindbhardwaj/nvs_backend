"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_LEADER_IMAGE_SIZE = exports.ALLOWED_LEADER_IMAGE_TYPES = void 0;
require("dotenv/config");
exports.ALLOWED_LEADER_IMAGE_TYPES = {
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
    png: ['image/png'],
    webp: ['image/webp'],
};
const configuredSize = Number(process.env.LEADERSHIP_MAX_UPLOAD_SIZE);
exports.MAX_LEADER_IMAGE_SIZE = Number.isSafeInteger(configuredSize) && configuredSize > 0
    ? configuredSize
    : 5 * 1024 * 1024;
//# sourceMappingURL=leadership.constants.js.map