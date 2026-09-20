import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JnvPrincipalsController } from './jnv-principals.controller';
import { JnvPrincipalsService } from './jnv-principals.service';
import { OrganizationIdentifierPipe } from './organization-identifier.pipe';
import { PublicJnvPrincipalsController } from './public-jnv-principals.controller';

@Module({
  imports: [AuthModule],
  controllers: [JnvPrincipalsController, PublicJnvPrincipalsController],
  providers: [JnvPrincipalsService, OrganizationIdentifierPipe],
})
export class JnvPrincipalsModule {}
