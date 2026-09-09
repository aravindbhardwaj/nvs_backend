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
exports.CreateGalleryImageDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const trim = ({ value }) => typeof value === 'string' ? value.trim() : value;
const boolean = ({ value, obj, key }) => {
    const rawValue = obj?.[key] ?? value;
    if (rawValue === true || rawValue === 'true')
        return true;
    if (rawValue === false || rawValue === 'false')
        return false;
    return rawValue;
};
class CreateGalleryImageDto {
    organizationId;
    titleEnglish;
    titleHindi;
    descriptionEnglish;
    descriptionHindi;
    altTextEnglish;
    altTextHindi;
    display_order;
    isActive;
    visible_to_all;
    start_date;
    end_date;
}
exports.CreateGalleryImageDto = CreateGalleryImageDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateGalleryImageDto.prototype, "organizationId", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateGalleryImageDto.prototype, "titleEnglish", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateGalleryImageDto.prototype, "titleHindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGalleryImageDto.prototype, "descriptionEnglish", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGalleryImageDto.prototype, "descriptionHindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateGalleryImageDto.prototype, "altTextEnglish", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateGalleryImageDto.prototype, "altTextHindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateGalleryImageDto.prototype, "display_order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateGalleryImageDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateGalleryImageDto.prototype, "visible_to_all", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({ strict: true }),
    __metadata("design:type", String)
], CreateGalleryImageDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({ strict: true }),
    __metadata("design:type", String)
], CreateGalleryImageDto.prototype, "end_date", void 0);
//# sourceMappingURL=create-gallery-image.dto.js.map