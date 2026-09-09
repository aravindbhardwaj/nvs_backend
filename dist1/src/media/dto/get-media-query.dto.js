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
exports.GetMediaQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const sort_order_enum_1 = require("../../common/enums/sort-order.enum");
class GetMediaQueryDto extends pagination_query_dto_1.PaginationQueryDto {
    organizationId;
    mediaTypeId;
    isDeleted;
    is_active;
    sort = 'uploadedAt';
    order = sort_order_enum_1.SortOrder.DESC;
}
exports.GetMediaQueryDto = GetMediaQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetMediaQueryDto.prototype, "organizationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetMediaQueryDto.prototype, "mediaTypeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === undefined ? undefined : value === true || value === 'true'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GetMediaQueryDto.prototype, "isDeleted", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === undefined ? undefined : value === true || value === 'true'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GetMediaQueryDto.prototype, "is_active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([
        'titleEnglish',
        'originalFilename',
        'mimeType',
        'fileSize',
        'uploadedAt',
        'createdAt',
        'updatedAt',
        'display_order',
        'is_active',
    ]),
    __metadata("design:type", Object)
], GetMediaQueryDto.prototype, "sort", void 0);
//# sourceMappingURL=get-media-query.dto.js.map