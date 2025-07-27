import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/entities/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: { email: string; id: number; roles?: UserRole[] }) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      roles: user.roles || [UserRole.USER] // Include roles in the JWT payload
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Create user with hashed password
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      // Ensure roles is always an array with at least one role
      roles: registerDto.roles && registerDto.roles.length > 0 
        ? registerDto.roles 
        : [UserRole.USER]
    });

    // No need to destructure password as it's already handled in the service
    return user;
  }
}