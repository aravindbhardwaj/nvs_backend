"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const organizations_module_1 = require("./organizations/organizations.module");
const organization_types_module_1 = require("./organization-types/organization-types.module");
const content_types_module_1 = require("./content-types/content-types.module");
const media_types_module_1 = require("./media-types/media-types.module");
const pages_module_1 = require("./pages/pages.module");
const media_module_1 = require("./media/media.module");
const forms_module_1 = require("./forms/forms.module");
const audit_logs_module_1 = require("./audit-logs/audit-logs.module");
const permissions_module_1 = require("./permissions/permissions.module");
const role_permissions_module_1 = require("./role-permissions/role-permissions.module");
const user_permissions_module_1 = require("./user-permissions/user-permissions.module");
const regions_module_1 = require("./regions/regions.module");
const states_module_1 = require("./states/states.module");
const districts_module_1 = require("./districts/districts.module");
const banners_module_1 = require("./banners/banners.module");
const gallery_module_1 = require("./gallery/gallery.module");
const menus_module_1 = require("./menus/menus.module");
const visitor_analytics_module_1 = require("./visitor-analytics/visitor-analytics.module");
const leadership_module_1 = require("./leadership/leadership.module");
const modals_module_1 = require("./modals/modals.module");
const jnv_principals_module_1 = require("./jnv-principals/jnv-principals.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const config_2 = __importDefault(require("./config"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                expandVariables: true,
                load: config_2.default,
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            organization_types_module_1.OrganizationTypesModule,
            content_types_module_1.ContentTypesModule,
            media_types_module_1.MediaTypesModule,
            pages_module_1.PagesModule,
            media_module_1.MediaModule,
            forms_module_1.FormsModule,
            audit_logs_module_1.AuditLogsModule,
            permissions_module_1.PermissionsModule,
            role_permissions_module_1.RolePermissionsModule,
            user_permissions_module_1.UserPermissionsModule,
            regions_module_1.RegionsModule,
            states_module_1.StatesModule,
            districts_module_1.DistrictsModule,
            banners_module_1.BannersModule,
            gallery_module_1.GalleryModule,
            menus_module_1.MenusModule,
            visitor_analytics_module_1.VisitorAnalyticsModule,
            leadership_module_1.LeadershipModule,
            modals_module_1.ModalsModule,
            jnv_principals_module_1.JnvPrincipalsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [{ provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard }, app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map