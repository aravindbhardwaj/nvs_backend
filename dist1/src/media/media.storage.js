"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaStorage = exports.UPLOADS_ROOT = void 0;
exports.validateMediaFile = validateMediaFile;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const node_path_1 = require("node:path");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const media_constants_1 = require("./media.constants");
exports.UPLOADS_ROOT = (0, node_path_1.join)(process.cwd(), 'resources', 'media_uploads');
function validateMediaFile(file) {
    const extension = (0, node_path_1.extname)(file.originalname).slice(1).toLowerCase();
    const allowedMimeTypes = media_constants_1.ALLOWED_MEDIA_TYPES[extension];
    const filenameWithoutExtension = file.originalname.slice(0, -(extension.length + 1));
    const hasDoubleExtension = Object.keys(media_constants_1.ALLOWED_MEDIA_TYPES).some((allowedExtension) => filenameWithoutExtension.toLowerCase().endsWith(`.${allowedExtension}`));
    if (!allowedMimeTypes ||
        hasDoubleExtension ||
        !allowedMimeTypes.includes(file.mimetype)) {
        throw new common_1.BadRequestException('The uploaded file type is not allowed.');
    }
}
exports.mediaStorage = (0, multer_1.diskStorage)({
    destination: (_request, _file, callback) => {
        const date = new Date();
        const destination = (0, node_path_1.join)(exports.UPLOADS_ROOT, String(date.getUTCFullYear()), String(date.getUTCMonth() + 1).padStart(2, '0'));
        (0, node_fs_1.mkdirSync)(destination, { recursive: true });
        callback(null, destination);
    },
    filename: (_request, file, callback) => {
        const extension = (0, node_path_1.extname)(file.originalname).toLowerCase();
        callback(null, `${(0, node_crypto_1.randomUUID)()}${extension}`);
    },
});
//# sourceMappingURL=media.storage.js.map