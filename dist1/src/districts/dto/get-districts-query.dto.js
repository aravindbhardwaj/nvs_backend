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
exports.GetDistrictsQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const sort_order_enum_1 = require("../../common/enums/sort-order.enum");
class GetDistrictsQueryDto extends pagination_query_dto_1.PaginationQueryDto {
    stateId;
    roId;
    isActive = true;
    sort = 'districtName';
    order = sort_order_enum_1.SortOrder.ASC;
}
exports.GetDistrictsQueryDto = GetDistrictsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetDistrictsQueryDto.prototype, "stateId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetDistrictsQueryDto.prototype, "roId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true'
        ? true
        : value === false || value === 'false'
            ? false
            : value),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], GetDistrictsQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([
        'districtName',
        'districtCode',
        'stateId',
        'roId',
        'createdAt',
        'updatedAt',
    ]),
    __metadata("design:type", Object)
], GetDistrictsQueryDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(sort_order_enum_1.SortOrder),
    __metadata("design:type", String)
], GetDistrictsQueryDto.prototype, "order", void 0);
//# sourceMappingURL=get-districts-query.dto.js.map