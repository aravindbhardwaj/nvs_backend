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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBannerDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const trimValue = ({ value }) => typeof value === 'string' ? value.trim() : value;
const toBoolean = ({ value }) => value === undefined || value === null
    ? value
    : value === true || value === 'true';
class CreateBannerDto {
    organizationId;
    titleEnglish;
    titleHindi;
    descriptionEnglish;
    descriptionHindi;
    altTextEnglish;
    altTextHindi;
    link_url;
    display_order;
    isActive;
    visible_to_all;
    start_date;
    end_date;
}
exports.CreateBannerDto = CreateBannerDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateBannerDto.prototype, "organizationId", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "titleEnglish", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "titleHindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "descriptionEnglish", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "descriptionHindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "altTextEnglish", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "altTextHindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsUrl)({ protocols: ['http', 'https'], require_protocol: true }),
    (0, class_validator_1.MaxLength)(2048),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "link_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateBannerDto.prototype, "display_order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBannerDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBannerDto.prototype, "visible_to_all", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({ strict: true }),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({ strict: true }),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "end_date", void 0);
//# sourceMappingURL=create-banner.dto.js.map