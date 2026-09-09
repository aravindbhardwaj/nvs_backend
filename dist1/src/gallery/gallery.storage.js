"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.galleryStorage = exports.GALLERY_UPLOADS_ROOT = void 0;
exports.validateGalleryFile = validateGalleryFile;
exports.validateGalleryImage = validateGalleryImage;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const multer_1 = require("multer");
const gallery_constants_1 = require("./gallery.constants");
exports.GALLERY_UPLOADS_ROOT = (0, node_path_1.join)(process.cwd(), process.env.GALLERY_UPLOAD_PATH ?? 'resources/gallery_uploads');
function validateGalleryFile(file) {
    const extension = (0, node_path_1.extname)(file.originalname).slice(1).toLowerCase();
    const allowedMimeTypes = gallery_constants_1.ALLOWED_GALLERY_TYPES[extension];
    const filenameWithoutExtension = file.originalname.slice(0, -(extension.length + 1));
    const hasDoubleExtension = Object.keys(gallery_constants_1.ALLOWED_GALLERY_TYPES).some((allowedExtension) => filenameWithoutExtension.toLowerCase().endsWith(`.${allowedExtension}`));
    if (!allowedMimeTypes ||
        hasDoubleExtension ||
        !allowedMimeTypes.includes(file.mimetype) ||
        file.size <= 0) {
        throw new common_1.BadRequestException('The uploaded gallery image type is not allowed.');
    }
}
async function validateGalleryImage(file) {
    validateGalleryFile(file);
    const header = await (0, promises_1.readFile)(file.path).then((contents) => contents.subarray(0, 12));
    const isJpeg = header.length >= 3 &&
        header[0] === 0xff &&
        header[1] === 0xd8 &&
        header[2] === 0xff;
    const isPng = header.length >= 8 &&
        header
            .subarray(0, 8)
            .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebp = header.length >= 12 &&
        header.subarray(0, 4).toString('ascii') === 'RIFF' &&
        header.subarray(8, 12).toString('ascii') === 'WEBP';
    if (!isJpeg && !isPng && !isWebp)
        throw new common_1.BadRequestException('The uploaded gallery image content is invalid.');
}
exports.galleryStorage = (0, multer_1.diskStorage)({
    destination: (_request, _file, callback) => {
        const date = new Date();
        const destination = (0, node_path_1.join)(exports.GALLERY_UPLOADS_ROOT, String(date.getUTCFullYear()), String(date.getUTCMonth() + 1).padStart(2, '0'));
        (0, node_fs_1.mkdirSync)(destination, { recursive: true });
        callback(null, destination);
    },
    filename: (_request, file, callback) => callback(null, `${(0, node_crypto_1.randomUUID)()}${(0, node_path_1.extname)(file.originalname).toLowerCase()}`),
});
//# sourceMappingURL=gallery.storage.js.map