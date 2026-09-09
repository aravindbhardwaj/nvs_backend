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
exports.PublicPagesController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const get_public_pages_query_dto_1 = require("./dto/get-public-pages-query.dto");
const pages_service_1 = require("./pages.service");
let PublicPagesController = class PublicPagesController {
    pages;
    constructor(pages) {
        this.pages = pages;
    }
    async findAll(query) {
        return {
            message: 'Public pages retrieved successfully.',
            data: await this.pages.findPublic(query),
        };
    }
    async findBySlug(slug) {
        return {
            message: 'Public page retrieved successfully.',
            data: await this.pages.findPublicBySlug(slug),
        };
    }
};
exports.PublicPagesController = PublicPagesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_public_pages_query_dto_1.GetPublicPagesQueryDto]),
    __metadata("design:returntype", Promise)
], PublicPagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicPagesController.prototype, "findBySlug", null);
exports.PublicPagesController = PublicPagesController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('api/public/pages'),
    __metadata("design:paramtypes", [pages_service_1.PagesService])
], PublicPagesController);
//# sourceMappingURL=public-pages.controller.js.map