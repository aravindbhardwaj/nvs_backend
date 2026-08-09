import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
  } from '@nestjs/common';
  
  import { AuthService } from './auth.service';
  
  import { LoginDto } from './dto/login.dto';
  import { RefreshTokenDto } from './dto/refresh-token.dto';
  import { ChangePasswordDto } from './dto/change-password.dto';
  
  import { JwtAuthGuard } from './guards/jwt-auth.guard';
  import { CurrentUser } from './decorators/current-user.decorator';
  
  import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
  
  @Controller('auth')
  export class AuthController {
    constructor(
      private readonly authService: AuthService,
    ) {}
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
      @Body() dto: LoginDto,
    ) {
      return {
        message: 'Login successful.',
        data: await this.authService.login(dto),
      };
    }
  
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
      @Body() dto: RefreshTokenDto,
    ) {
      return {
        message: 'Token refreshed successfully.',
        data: await this.authService.refreshToken(dto),
      };
    }
  
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(
      @Body('refreshToken') refreshToken: string,
    ) {
      await this.authService.logout(refreshToken);
  
      return {
        message: 'Logout successful.',
        data: null,
      };
    }
  
    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async changePassword(
      @CurrentUser() user: AuthenticatedUser,
      @Body() dto: ChangePasswordDto,
    ) {
      await this.authService.changePassword(
        user,
        dto,
      );
  
      return {
        message: 'Password changed successfully.',
        data: null,
      };
    }
  }