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
exports.PublicModalsController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const get_public_modals_query_dto_1 = require("./dto/get-public-modals-query.dto");
const modals_service_1 = require("./modals.service");
let PublicModalsController = class PublicModalsController {
    modals;
    constructor(modals) {
        this.modals = modals;
    }
    async findAll(query) {
        return {
            message: 'Active modals retrieved successfully.',
            data: await this.modals.findPublic(query),
        };
    }
};
exports.PublicModalsController = PublicModalsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_public_modals_query_dto_1.GetPublicModalsQueryDto]),
    __metadata("design:returntype", Promise)
], PublicModalsController.prototype, "findAll", null);
exports.PublicModalsController = PublicModalsController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('api/public/modals'),
    __metadata("design:paramtypes", [modals_service_1.ModalsService])
], PublicModalsController);
//# sourceMappingURL=public-modals.controller.js.map