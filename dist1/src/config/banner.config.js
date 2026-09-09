"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const DEFAULT_MAX_BANNERS_PER_ORGANIZATION = 5;
const positiveIntegerOrDefault = (value) => {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0
        ? parsed
        : DEFAULT_MAX_BANNERS_PER_ORGANIZATION;
};
exports.default = (0, config_1.registerAs)('banner', () => ({
    maxBannersPerOrganization: positiveIntegerOrDefault(process.env.MAX_BANNERS_PER_ORGANIZATION ??
        process.env.MAX_BANNERS_PER_USER),
}));
//# sourceMappingURL=banner.config.js.map