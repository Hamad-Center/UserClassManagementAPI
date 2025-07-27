// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/entities/user-role.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      // Set default role if not provided
      if (!registerDto.roles || registerDto.roles.length === 0) {
        registerDto.roles = [UserRole.USER];
      }
      
      const user = await this.authService.register(registerDto);
      return {
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles
        }
      };
    } catch (error) {
      if (error.code === 'P2002') { // Prisma unique constraint violation
        throw new ConflictException('Email already exists');
      }
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }
}