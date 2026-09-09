"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadershipModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const leadership_controller_1 = require("./leadership.controller");
const leadership_service_1 = require("./leadership.service");
const public_leadership_controller_1 = require("./public-leadership.controller");
let LeadershipModule = class LeadershipModule {
};
exports.LeadershipModule = LeadershipModule;
exports.LeadershipModule = LeadershipModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [leadership_controller_1.LeadershipController, public_leadership_controller_1.PublicLeadershipController],
        providers: [leadership_service_1.LeadershipService],
    })
], LeadershipModule);
//# sourceMappingURL=leadership.module.js.map