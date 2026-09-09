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
exports.UploadMediaDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const trimValue = ({ value }) => typeof value === 'string' ? value.trim() : value;
const emptyDateToUndefined = ({ value }) => {
    if (typeof value !== 'string')
        return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
};
const toBoolean = ({ value }) => value === undefined || value === null
    ? value
    : value === true || value === 'true';
class UploadMediaDto {
    organizationId;
    titleEnglish;
    titleHindi;
    descriptionEnglish;
    descriptionHindi;
    mediaTypeId;
    sharedMediaTypeIds;
    display_order;
    is_active;
    is_new;
    visible_to_all;
    ro_ids;
    jnv_ids;
    important_link_1;
    important_link_2;
    important_link_3;
    start_date;
    end_date;
}
exports.UploadMediaDto = UploadMediaDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UploadMediaDto.prototype, "organizationId", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "titleEnglish", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "titleHindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "descriptionEnglish", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "descriptionHindi", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UploadMediaDto.prototype, "mediaTypeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", Object)
], UploadMediaDto.prototype, "sharedMediaTypeIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UploadMediaDto.prototype, "display_order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UploadMediaDto.prototype, "is_active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], UploadMediaDto.prototype, "is_new", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UploadMediaDto.prototype, "visible_to_all", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", Object)
], UploadMediaDto.prototype, "ro_ids", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", Object)
], UploadMediaDto.prototype, "jnv_ids", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], UploadMediaDto.prototype, "important_link_1", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], UploadMediaDto.prototype, "important_link_2", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], UploadMediaDto.prototype, "important_link_3", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(emptyDateToUndefined),
    (0, class_validator_1.IsDateString)({ strict: true }),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({ strict: true }),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "end_date", void 0);
//# sourceMappingURL=upload-media.dto.js.map