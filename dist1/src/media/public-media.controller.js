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
exports.PublicMediaController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const get_public_media_query_dto_1 = require("./dto/get-public-media-query.dto");
const media_service_1 = require("./media.service");
let PublicMediaController = class PublicMediaController {
    media;
    constructor(media) {
        this.media = media;
    }
    async findAll(query) {
        return {
            message: 'Public media retrieved successfully.',
            data: await this.media.findPublic(query),
        };
    }
    async findImportantLink1(query) {
        return {
            message: 'Public important link 1 media retrieved successfully.',
            data: await this.media.findImportantLinks(query, 'importantLink1'),
        };
    }
    async findImportantLink2(query) {
        return {
            message: 'Public important link 2 media retrieved successfully.',
            data: await this.media.findImportantLinks(query, 'importantLink2'),
        };
    }
    async findImportantLink3(query) {
        return {
            message: 'Public important link 3 media retrieved successfully.',
            data: await this.media.findImportantLinks(query, 'importantLink3'),
        };
    }
    async download(id, organizationId, response) {
        const document = await this.media.publicDownload(id, organizationId === undefined ? undefined : Number(organizationId));
        response.setHeader('Content-Type', document.mimeType);
        response.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(document.filename)}`);
        document.stream.on('error', () => response.destroy());
        document.stream.pipe(response);
    }
    async downloadHindi(id, organizationId, response) {
        const document = await this.media.publicDownloadHindi(id, organizationId === undefined ? undefined : Number(organizationId));
        response.setHeader('Content-Type', document.mimeType);
        response.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(document.filename)}`);
        document.stream.on('error', () => response.destroy());
        document.stream.pipe(response);
    }
};
exports.PublicMediaController = PublicMediaController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_public_media_query_dto_1.GetPublicMediaQueryDto]),
    __metadata("design:returntype", Promise)
], PublicMediaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('important-link-1'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_public_media_query_dto_1.GetPublicMediaQueryDto]),
    __metadata("design:returntype", Promise)
], PublicMediaController.prototype, "findImportantLink1", null);
__decorate([
    (0, common_1.Get)('important-link-2'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_public_media_query_dto_1.GetPublicMediaQueryDto]),
    __metadata("design:returntype", Promise)
], PublicMediaController.prototype, "findImportantLink2", null);
__decorate([
    (0, common_1.Get)('important-link-3'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_public_media_query_dto_1.GetPublicMediaQueryDto]),
    __metadata("design:returntype", Promise)
], PublicMediaController.prototype, "findImportantLink3", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('organization_id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PublicMediaController.prototype, "download", null);
__decorate([
    (0, common_1.Get)(':id/download/hindi'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('organization_id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PublicMediaController.prototype, "downloadHindi", null);
exports.PublicMediaController = PublicMediaController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('api/public/media'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], PublicMediaController);
//# sourceMappingURL=public-media.controller.js.map