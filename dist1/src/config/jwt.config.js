"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '30m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
}));
//# sourceMappingURL=jwt.config.js.map