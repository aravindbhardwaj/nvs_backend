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
exports.CreatePageDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const trimValue = ({ value }) => typeof value === 'string' ? value.trim() : value;
class CreatePageDto {
    organizationId;
    contentTypeId;
    titleEnglish;
    titleHindi;
    shortDescriptionEnglish;
    shortDescriptionHindi;
    contentEnglish;
    contentHindi;
    status;
    start_date;
    end_date;
    display_order;
}
exports.CreatePageDto = CreatePageDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePageDto.prototype, "organizationId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePageDto.prototype, "contentTypeId", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePageDto.prototype, "titleEnglish", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePageDto.prototype, "titleHindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePageDto.prototype, "shortDescriptionEnglish", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePageDto.prototype, "shortDescriptionHindi", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePageDto.prototype, "contentEnglish", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePageDto.prototype, "contentHindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PageStatus),
    __metadata("design:type", String)
], CreatePageDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], CreatePageDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], CreatePageDto.prototype, "end_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePageDto.prototype, "display_order", void 0);
//# sourceMappingURL=create-page.dto.js.map