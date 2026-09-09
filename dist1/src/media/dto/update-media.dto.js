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
exports.UpdateMediaDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const trimValue = ({ value }) => typeof value === 'string' ? value.trim() : value;
const toBoolean = ({ value }) => value === undefined || value === null
    ? value
    : value === true || value === 'true';
class UpdateMediaDto {
    externalUrl;
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
exports.UpdateMediaDto = UpdateMediaDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)({ protocols: ['https'], require_protocol: true }),
    (0, class_validator_1.MaxLength)(2048),
    __metadata("design:type", String)
], UpdateMediaDto.prototype, "externalUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateMediaDto.prototype, "titleEnglish", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateMediaDto.prototype, "titleHindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMediaDto.prototype, "descriptionEnglish", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMediaDto.prototype, "descriptionHindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateMediaDto.prototype, "mediaTypeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", Object)
], UpdateMediaDto.prototype, "sharedMediaTypeIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateMediaDto.prototype, "display_order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMediaDto.prototype, "is_active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], UpdateMediaDto.prototype, "is_new", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], UpdateMediaDto.prototype, "visible_to_all", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", Object)
], UpdateMediaDto.prototype, "ro_ids", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", Object)
], UpdateMediaDto.prototype, "jnv_ids", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], UpdateMediaDto.prototype, "important_link_1", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], UpdateMediaDto.prototype, "important_link_2", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], UpdateMediaDto.prototype, "important_link_3", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({ strict: true }),
    __metadata("design:type", Object)
], UpdateMediaDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({ strict: true }),
    __metadata("design:type", Object)
], UpdateMediaDto.prototype, "end_date", void 0);
//# sourceMappingURL=update-media.dto.js.map