"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JnvPrincipalsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const jnv_principals_controller_1 = require("./jnv-principals.controller");
const jnv_principals_service_1 = require("./jnv-principals.service");
const public_jnv_principals_controller_1 = require("./public-jnv-principals.controller");
let JnvPrincipalsModule = class JnvPrincipalsModule {
};
exports.JnvPrincipalsModule = JnvPrincipalsModule;
exports.JnvPrincipalsModule = JnvPrincipalsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [jnv_principals_controller_1.JnvPrincipalsController, public_jnv_principals_controller_1.PublicJnvPrincipalsController],
        providers: [jnv_principals_service_1.JnvPrincipalsService],
    })
], JnvPrincipalsModule);
//# sourceMappingURL=jnv-principals.module.js.map