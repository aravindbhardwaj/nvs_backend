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
exports.PublicJnvPrincipalsController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const jnv_principals_service_1 = require("./jnv-principals.service");
let PublicJnvPrincipalsController = class PublicJnvPrincipalsController {
    principals;
    constructor(principals) {
        this.principals = principals;
    }
    async current(organizationId) {
        return {
            message: 'Current JNV principal retrieved successfully.',
            data: await this.principals.findPublicCurrent(organizationId),
        };
    }
    async history(organizationId) {
        return {
            message: 'JNV principal history retrieved successfully.',
            data: await this.principals.findPublicHistory(organizationId),
        };
    }
    async image(organizationId, id, response) {
        const image = await this.principals.imageStream(organizationId, id, true);
        response.setHeader('Content-Type', image.mimeType);
        image.stream.on('error', () => response.destroy());
        image.stream.pipe(response);
    }
};
exports.PublicJnvPrincipalsController = PublicJnvPrincipalsController;
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, common_1.Param)('organizationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PublicJnvPrincipalsController.prototype, "current", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Param)('organizationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PublicJnvPrincipalsController.prototype, "history", null);
__decorate([
    (0, common_1.Get)(':id/image'),
    __param(0, (0, common_1.Param)('organizationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PublicJnvPrincipalsController.prototype, "image", null);
exports.PublicJnvPrincipalsController = PublicJnvPrincipalsController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('api/public/jnvs/:organizationId/principals'),
    __metadata("design:paramtypes", [jnv_principals_service_1.JnvPrincipalsService])
], PublicJnvPrincipalsController);
//# sourceMappingURL=public-jnv-principals.controller.js.map