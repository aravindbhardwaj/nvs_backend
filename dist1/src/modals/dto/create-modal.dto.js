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
exports.CreateModalDto = exports.SAFE_MODAL_LINK_MESSAGE = exports.SAFE_MODAL_LINK = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const trim = ({ value }) => typeof value === 'string' ? value.trim() : value;
const boolean = ({ value }) => value === undefined || value === null
    ? value
    : value === true || value === 'true';
exports.SAFE_MODAL_LINK = /^(?:https:\/\/|\/(?!\/))\S+$/i;
exports.SAFE_MODAL_LINK_MESSAGE = 'link must be an HTTPS URL or an internal path beginning with /.';
class CreateModalDto {
    text_english;
    text_hindi;
    link;
    display_order;
    isActive;
    start_date;
    end_date;
}
exports.CreateModalDto = CreateModalDto;
__decorate([
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(10000),
    __metadata("design:type", String)
], CreateModalDto.prototype, "text_english", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(10000),
    __metadata("design:type", String)
], CreateModalDto.prototype, "text_hindi", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(2048),
    (0, class_validator_1.Matches)(exports.SAFE_MODAL_LINK, { message: exports.SAFE_MODAL_LINK_MESSAGE }),
    __metadata("design:type", String)
], CreateModalDto.prototype, "link", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateModalDto.prototype, "display_order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateModalDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({ strict: true }),
    __metadata("design:type", String)
], CreateModalDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({ strict: true }),
    __metadata("design:type", String)
], CreateModalDto.prototype, "end_date", void 0);
//# sourceMappingURL=create-modal.dto.js.map