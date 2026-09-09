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
exports.GetLeadersQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const sort_order_enum_1 = require("../../common/enums/sort-order.enum");
class GetLeadersQueryDto extends pagination_query_dto_1.PaginationQueryDto {
    isActive;
    isDeleted;
    sort = 'display_order';
    order = sort_order_enum_1.SortOrder.ASC;
}
exports.GetLeadersQueryDto = GetLeadersQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === undefined ? undefined : value === true || value === 'true'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GetLeadersQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === undefined ? undefined : value === true || value === 'true'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GetLeadersQueryDto.prototype, "isDeleted", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([
        'leaderNameEnglish',
        'leaderDesignationEnglish',
        'display_order',
        'isActive',
        'createdAt',
        'updatedAt',
    ]),
    __metadata("design:type", Object)
], GetLeadersQueryDto.prototype, "sort", void 0);
//# sourceMappingURL=get-leaders-query.dto.js.map