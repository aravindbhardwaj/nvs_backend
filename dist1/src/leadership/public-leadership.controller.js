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
exports.PublicLeadershipController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const leadership_service_1 = require("./leadership.service");
let PublicLeadershipController = class PublicLeadershipController {
    leadership;
    constructor(leadership) {
        this.leadership = leadership;
    }
    async findAll() {
        return {
            message: 'Leadership data retrieved successfully.',
            data: await this.leadership.findPublic(),
        };
    }
    async image(id, response) {
        const image = await this.leadership.imageStream(id, true);
        response.setHeader('Content-Type', image.mimeType);
        image.stream.on('error', () => response.destroy());
        image.stream.pipe(response);
    }
    async findOne(id) {
        return {
            message: 'Leader retrieved successfully.',
            data: await this.leadership.findPublicOne(id),
        };
    }
};
exports.PublicLeadershipController = PublicLeadershipController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicLeadershipController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/image'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PublicLeadershipController.prototype, "image", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PublicLeadershipController.prototype, "findOne", null);
exports.PublicLeadershipController = PublicLeadershipController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('api/public/leadership'),
    __metadata("design:paramtypes", [leadership_service_1.LeadershipService])
], PublicLeadershipController);
//# sourceMappingURL=public-leadership.controller.js.map