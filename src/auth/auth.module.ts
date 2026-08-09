import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './services/password.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.getOrThrow('jwt.accessExpiresIn') as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    })
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    PasswordService,
    JwtStrategy,
  ],

  exports: [
    JwtModule,
    AuthService,
    PasswordService,
  ],
})
export class AuthModule {}