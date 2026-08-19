import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Req,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/dto.register';
import { AuthRegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ message: string; status: number }> {
    await this.authService.register(registerDto);
    return { message: 'User registered successfully', status: 201 };
  }
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ message: string; status: number; token: string }> {
    const token = await this.authService.login(loginDto);
    return {
      message: 'User logged in successfully',
      status: 200,
      token: token.token,
    };
  }
  @Get('login')
  @UseGuards(AuthGuard)
  async checkToken(
    @Request() req: any,
  ): Promise<{ message: string; status: number }> {
    return { message: 'Token is valid', status: 200 };
  }
}
