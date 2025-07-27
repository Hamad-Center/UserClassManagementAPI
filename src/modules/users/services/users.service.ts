import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User, CreateUserDto, UpdateUserDto } from '../interfaces/user.interface';
import { UserRole } from '../entities/user-role.enum';
import * as bcrypt from 'bcrypt';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersService {
    private users: User[] = [
        {
            id: 1,
            email: 'admin@example.com',
            password: bcrypt.hashSync('admin123', 10),
            firstName: 'Admin',
            lastName: 'User',
            roles: [UserRole.ADMIN],
            phoneNumber: '+1234567890',
            department: 'IT',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 2,
            email: 'engineer@example.com',
            password: bcrypt.hashSync('engineer123', 10),
            firstName: 'Engineer',
            lastName: 'User',
            roles: [UserRole.ENGINEER],
            phoneNumber: '+1234567891',
            department: 'Engineering',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 3,
            email: 'intern@example.com',
            password: bcrypt.hashSync('intern123', 10),
            firstName: 'Intern',
            lastName: 'User',
            roles: [UserRole.INTERN],
            phoneNumber: '+1234567892',
            department: 'Internship',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    async findAll(role?: UserRole): Promise<UserWithoutPassword[]> {
        if (role) {
            const usersWithRole = this.users.filter(user => user.roles.includes(role));
            if (usersWithRole.length === 0) {
                throw new NotFoundException(`No users found with role: ${role}`);
            }
            return usersWithRole.map(({ password, ...user }) => user);
        }
        return this.users.map(({ password, ...user }) => user);
    }

    async findOne(id: number): Promise<UserWithoutPassword> {
        const user = this.users.find(user => user.id === id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        const { password, ...result } = user;
        return result;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.users.find(user => user.email === email);
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

        // Hash password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        
        // Create new user
        const newUser: User = {
            id: Math.max(...this.users.map(user => user.id), 0) + 1,
            ...createUserDto,
            password: hashedPassword,
            roles: createUserDto.roles || [UserRole.USER],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.users.push(newUser);
        
        // Return user without password
        const { password, ...result } = newUser;
        return result;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserWithoutPassword> {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Check if email is being updated and already exists
        if (updateUserDto.email && updateUserDto.email !== this.users[userIndex].email) {
            const emailExists = this.users.some(user => user.email === updateUserDto.email);
            if (emailExists) {
                throw new BadRequestException('Email already in use');
            }
        }

        // Hash new password if provided
        let hashedPassword = this.users[userIndex].password;
        if (updateUserDto.password) {
            hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
        }

        // Update user
        const updatedUser = {
            ...this.users[userIndex],
            ...updateUserDto,
            password: hashedPassword,
            updatedAt: new Date(),
        };

        // Ensure roles is an array and remove duplicates
        if (updateUserDto.roles) {
            updatedUser.roles = [...new Set(updateUserDto.roles)];
        }

        this.users[userIndex] = updatedUser;
        
        // Return user without password
        const { password, ...result } = updatedUser;
        return result;
    }

    async remove(id: number): Promise<void> {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        this.users.splice(userIndex, 1);
    }
}