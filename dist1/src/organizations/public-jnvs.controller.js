"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicJnvsController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const get_public_jnvs_query_dto_1 = require("./dto/get-public-jnvs-query.dto");
const organizations_service_1 = require("./organizations.service");
let PublicJnvsController = class PublicJnvsController {
    organizations;
    constructor(organizations) {
        this.organizations = organizations;
    }
    async stateMap() {
        return {
            message: 'JNV state map retrieved successfully.',
            data: await this.organizations.findPublicJnvStateMap(),
        };
    }
    async findAll(query) {
        return {
            message: 'JNVs retrieved successfully.',
            data: await this.organizations.findPublicJnvs(query),
        };
    }
};
exports.PublicJnvsController = PublicJnvsController;
__decorate([
    (0, common_1.Get)('state-map'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicJnvsController.prototype, "stateMap", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_public_jnvs_query_dto_1.GetPublicJnvsQueryDto]),
    __metadata("design:returntype", Promise)
], PublicJnvsController.prototype, "findAll", null);
exports.PublicJnvsController = PublicJnvsController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('api/public/jnvs'),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], PublicJnvsController);
//# sourceMappingURL=public-jnvs.controller.js.map