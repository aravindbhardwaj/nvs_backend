import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { OrganizationTypesModule } from './organization-types/organization-types.module';
import { ContentTypesModule } from './content-types/content-types.module';
import { MediaTypesModule } from './media-types/media-types.module';
import { PagesModule } from './pages/pages.module';
import { MediaModule } from './media/media.module';
import { FormsModule } from './forms/forms.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolePermissionsModule } from './role-permissions/role-permissions.module';
import { UserPermissionsModule } from './user-permissions/user-permissions.module';
import { RegionsModule } from './regions/regions.module';
import { StatesModule } from './states/states.module';
import { DistrictsModule } from './districts/districts.module';
import { BannersModule } from './banners/banners.module';
import { GalleryModule } from './gallery/gallery.module';
import { MenusModule } from './menus/menus.module';
import { VisitorAnalyticsModule } from './visitor-analytics/visitor-analytics.module';
import { LeadershipModule } from './leadership/leadership.module';
import { ModalsModule } from './modals/modals.module';
import { JnvPrincipalsModule } from './jnv-principals/jnv-principals.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import configuration from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: configuration,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    OrganizationTypesModule,
    ContentTypesModule,
    MediaTypesModule,
    PagesModule,
    MediaModule,
    FormsModule,
    AuditLogsModule,
    PermissionsModule,
    RolePermissionsModule,
    UserPermissionsModule,
    RegionsModule,
    StatesModule,
    DistrictsModule,
    BannersModule,
    GalleryModule,
    MenusModule,
    VisitorAnalyticsModule,
    LeadershipModule,
    ModalsModule,
    JnvPrincipalsModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }, AppService],
})
export class AppModule {}
