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
exports.GetStatesQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const sort_order_enum_1 = require("../../common/enums/sort-order.enum");
class GetStatesQueryDto extends pagination_query_dto_1.PaginationQueryDto {
    ro_id;
    sort = 'stateName';
    order = sort_order_enum_1.SortOrder.ASC;
}
exports.GetStatesQueryDto = GetStatesQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetStatesQueryDto.prototype, "ro_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['stateName', 'stateCode', 'roId', 'isoCode']),
    __metadata("design:type", Object)
], GetStatesQueryDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(sort_order_enum_1.SortOrder),
    __metadata("design:type", String)
], GetStatesQueryDto.prototype, "order", void 0);
//# sourceMappingURL=get-states-query.dto.js.map