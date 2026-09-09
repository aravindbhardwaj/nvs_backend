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
exports.CreateMenuDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const menu_constants_1 = require("../menu.constants");
const trimValue = ({ value }) => typeof value === 'string' ? value.trim() : value;
const toBoolean = ({ value }) => value === undefined || value === null
    ? value
    : value === true || value === 'true';
class CreateMenuDto {
    organization_type_id;
    menu_location;
    parent_menu_id;
    title_english;
    title_hindi;
    content_type_id;
    media_type_id;
    external_url;
    link_target;
    display_order;
    is_active;
    show_on_all_organizations;
}
exports.CreateMenuDto = CreateMenuDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateMenuDto.prototype, "organization_type_id", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsIn)(menu_constants_1.MENU_LOCATION_VALUES),
    __metadata("design:type", Number)
], CreateMenuDto.prototype, "menu_location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], CreateMenuDto.prototype, "parent_menu_id", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "title_english", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", Object)
], CreateMenuDto.prototype, "title_hindi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], CreateMenuDto.prototype, "content_type_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], CreateMenuDto.prototype, "media_type_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsUrl)({ protocols: ['http', 'https'], require_protocol: true }),
    (0, class_validator_1.MaxLength)(2048),
    __metadata("design:type", Object)
], CreateMenuDto.prototype, "external_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsIn)(menu_constants_1.LINK_TARGET_VALUES),
    __metadata("design:type", Number)
], CreateMenuDto.prototype, "link_target", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMenuDto.prototype, "display_order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMenuDto.prototype, "is_active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMenuDto.prototype, "show_on_all_organizations", void 0);
//# sourceMappingURL=create-menu.dto.js.map