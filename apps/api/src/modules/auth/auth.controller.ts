import { Controller, Post, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  async register(
    @Body()
    dto: {
      email: string;
      username: string;
      password: string;
      fullName?: string;
    },
  ) {
    return this.authService.register(dto.email, dto.username, dto.password, dto.fullName);
  }

  @Get('me')
  async getCurrentUser() {
    // TODO: Add @CurrentUser() decorator to extract userId
    const userId = 'demo-user';
    return this.authService.getCurrentUser(userId);
  }
}
