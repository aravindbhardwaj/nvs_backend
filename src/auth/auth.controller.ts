import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Controller('api/auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return {
      message: 'Login successful.',
      data: await this.authService.login(dto),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return {
      message: 'Token refreshed successfully.',
      data: await this.authService.refresh(dto),
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() dto: RefreshTokenDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.authService.logout(dto, user.id);

    return { message: 'Logout successful.' };
  }
}
