import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { User, CreateUserDto, UpdateUserDto } from '../interfaces/user.interface';
import { UserRole } from '../entities/user-role.enum';
import { IUserRepository } from '../interfaces/user-repository.interface';
import * as bcrypt from 'bcrypt';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersService {
    constructor(
        @Inject('IUserRepository') private readonly userRepository: IUserRepository
    ) { }

    async findAll(role?: UserRole): Promise<UserWithoutPassword[]> {
        try {
            const users = await this.userRepository.findAll(role);
            return users.map(({ password, ...user }) => user);
        } catch (error) {
            if (error.message.includes('No users found')) {
                throw new NotFoundException(`No users found with role: ${role}`);
            }
            throw error;
        }
    }

    async findOne(id: number): Promise<UserWithoutPassword> {
        const user = await this.userRepository.findOne(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        const { password, ...result } = user;
        return result;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const user = await this.userRepository.findByEmail(email);
        return user || undefined;
    }

    async validateUser(email: string, password: string): Promise<UserWithoutPassword | null> {
        const user = await this.findByEmail(email);
        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
        // Check if user with email already exists
        const existingUser = await this.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new BadRequestException('Email already in use');
        }

        // Create new user (password hashing is handled in repository)
        const newUser = await this.userRepository.create(createUserDto);

        // Return user without password
        const { password, ...result } = newUser;
        return result;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserWithoutPassword> {
        // Check if user exists
        const existingUser = await this.userRepository.findOne(id);
        if (!existingUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Check if email is being updated and already exists
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailExists = await this.userRepository.findByEmail(updateUserDto.email);
            if (emailExists) {
                throw new BadRequestException('Email already in use');
            }
        }

        // Update user (password hashing is handled in repository)
        const updatedUser = await this.userRepository.update(id, updateUserDto);

        // Return user without password
        const { password, ...result } = updatedUser;
        return result;
    }

    async remove(id: number): Promise<void> {
        const existingUser = await this.userRepository.findOne(id);
        if (!existingUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        await this.userRepository.delete(id);
    }
}