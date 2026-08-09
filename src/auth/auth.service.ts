import {
    Injectable,
    NotImplementedException,
  } from '@nestjs/common';
  
  import { LoginDto } from './dto/login.dto';
  import { RefreshTokenDto } from './dto/refresh-token.dto';
  import { ChangePasswordDto } from './dto/change-password.dto';
  
  import { AuthResponseDto } from './dto/auth-response.dto';
  
  import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
  
  @Injectable()
  export class AuthService {
    async login(
      dto: LoginDto,
    ): Promise<AuthResponseDto> {
      throw new NotImplementedException();
    }
  
    async refreshToken(
      dto: RefreshTokenDto,
    ): Promise<AuthResponseDto> {
      throw new NotImplementedException();
    }
  
    async logout(
      refreshToken: string,
    ): Promise<void> {
      throw new NotImplementedException();
    }
  
    async changePassword(
      user: AuthenticatedUser,
      dto: ChangePasswordDto,
    ): Promise<void> {
      throw new NotImplementedException();
    }
  }