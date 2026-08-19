import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/dto.register';
import { AuthRegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    try {
      const { email, password } = registerDto;
      if (await this.prisma.user.findUnique({ where: { email } })) {
        throw new BadRequestException('Email already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: { email, password: hashedPassword },
        select: { email: true, password: true }, //איזה שדות יחזרו אם יתקבל
      });
      if (!user) {
        throw new BadRequestException('Failed to create user');
      }
      return {
        message: 'User created successfully',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const payload = {
      id: user.id,
      email: user.email,
    };

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
  async checkToken(token: string): Promise<{ message: string; user: any }> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return { message: 'Token is valid', user: payload };
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }
}
