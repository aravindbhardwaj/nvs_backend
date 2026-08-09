import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ContentTypesModule } from './content-types/content-types.module';
import { MediaTypesModule } from './media-types/media-types.module';
import { PagesModule } from './pages/pages.module';
import { MediaModule } from './media/media.module';
import { FormsModule } from './forms/forms.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import configuration from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: configuration,
    }),
    PrismaModule, AuthModule, UsersModule, OrganizationsModule, ContentTypesModule, MediaTypesModule, PagesModule, MediaModule, FormsModule, AuditLogsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
