"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_config_1 = __importDefault(require("./auth.config"));
const banner_config_1 = __importDefault(require("./banner.config"));
const jwt_config_1 = __importDefault(require("./jwt.config"));
const configuration = [auth_config_1.default, banner_config_1.default, jwt_config_1.default];
exports.default = configuration;
//# sourceMappingURL=index.js.map