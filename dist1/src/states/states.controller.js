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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const require_permission_decorator_1 = require("../auth/decorators/require-permission.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const get_states_query_dto_1 = require("./dto/get-states-query.dto");
const states_service_1 = require("./states.service");
let StatesController = class StatesController {
    statesService;
    constructor(statesService) {
        this.statesService = statesService;
    }
    async findAll(query) {
        return {
            message: 'States retrieved successfully.',
            data: await this.statesService.findAll(query),
        };
    }
};
exports.StatesController = StatesController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('STATE_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_states_query_dto_1.GetStatesQueryDto]),
    __metadata("design:returntype", Promise)
], StatesController.prototype, "findAll", null);
exports.StatesController = StatesController = __decorate([
    (0, common_1.Controller)('api/states'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [states_service_1.StatesService])
], StatesController);
//# sourceMappingURL=states.controller.js.map