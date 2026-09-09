"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jnvPrincipalStorage = exports.JNV_PRINCIPAL_UPLOADS_ROOT = void 0;
exports.validateJnvPrincipalFile = validateJnvPrincipalFile;
exports.validateJnvPrincipalImage = validateJnvPrincipalImage;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const multer_1 = require("multer");
const jnv_principals_constants_1 = require("./jnv-principals.constants");
exports.JNV_PRINCIPAL_UPLOADS_ROOT = (0, node_path_1.join)(process.cwd(), process.env.JNV_PRINCIPAL_UPLOAD_PATH ?? 'resources/jnv_principal_uploads');
function validateJnvPrincipalFile(file) {
    const extension = (0, node_path_1.extname)(file.originalname).slice(1).toLowerCase();
    const allowed = jnv_principals_constants_1.ALLOWED_JNV_PRINCIPAL_IMAGE_TYPES[extension];
    const base = file.originalname.slice(0, -(extension.length + 1));
    const doubleExtension = Object.keys(jnv_principals_constants_1.ALLOWED_JNV_PRINCIPAL_IMAGE_TYPES).some((item) => base.toLowerCase().endsWith(`.${item}`));
    if (!allowed ||
        doubleExtension ||
        !allowed.includes(file.mimetype) ||
        file.size <= 0) {
        throw new common_1.BadRequestException('The uploaded principal picture type is not allowed.');
    }
}
async function validateJnvPrincipalImage(file) {
    validateJnvPrincipalFile(file);
    const extension = (0, node_path_1.extname)(file.originalname).slice(1).toLowerCase();
    const header = (await (0, promises_1.readFile)(file.path)).subarray(0, 12);
    const jpeg = header.length >= 3 &&
        header[0] === 0xff &&
        header[1] === 0xd8 &&
        header[2] === 0xff;
    const png = header.length >= 8 &&
        header
            .subarray(0, 8)
            .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const webp = header.length >= 12 &&
        header.subarray(0, 4).toString('ascii') === 'RIFF' &&
        header.subarray(8, 12).toString('ascii') === 'WEBP';
    const detectedType = jpeg
        ? 'image/jpeg'
        : png
            ? 'image/png'
            : webp
                ? 'image/webp'
                : null;
    const extensionMatches = (detectedType === 'image/jpeg' &&
        (extension === 'jpg' || extension === 'jpeg')) ||
        (detectedType === 'image/png' && extension === 'png') ||
        (detectedType === 'image/webp' && extension === 'webp');
    if (!detectedType || !extensionMatches) {
        throw new common_1.BadRequestException('The uploaded principal picture content is invalid.');
    }
    file.mimetype = detectedType;
}
exports.jnvPrincipalStorage = (0, multer_1.diskStorage)({
    destination: (_request, _file, callback) => {
        const date = new Date();
        const destination = (0, node_path_1.join)(exports.JNV_PRINCIPAL_UPLOADS_ROOT, String(date.getUTCFullYear()), String(date.getUTCMonth() + 1).padStart(2, '0'));
        (0, node_fs_1.mkdirSync)(destination, { recursive: true });
        callback(null, destination);
    },
    filename: (_request, file, callback) => callback(null, `${(0, node_crypto_1.randomUUID)()}${(0, node_path_1.extname)(file.originalname).toLowerCase()}`),
});
//# sourceMappingURL=jnv-principals.storage.js.map