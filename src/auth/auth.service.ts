import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

import { PasswordService } from './services/password.service';

import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<AuthResponseDto> {
    throw new Error('Not implemented');
  }

  async refreshToken(
    dto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    throw new Error('Not implemented');
  }

  async logout(
    refreshToken: string,
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  async changePassword(
    user: AuthenticatedUser,
    dto: ChangePasswordDto,
  ): Promise<void> {
    throw new Error('Not implemented');
  }
}