import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRole } from '../interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto): Promise<any> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        return this.prisma.user.create({
            data: {
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
                email: createUserDto.email,
                password: hashedPassword,
                phoneNumber: createUserDto.phoneNumber,
                department: createUserDto.department,
                roles: createUserDto.roles || [UserRole.USER],
            },
        });
    }

    async findAll(role?: UserRole): Promise<any[]> {
        // Get all users first
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                department: true,
                roles: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Filter by role if specified
        if (role) {
            return users.filter((user: any) => user.roles.includes(role));
        }

        return users;
    }

    async findOne(id: number): Promise<any | null> {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                department: true,
                roles: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findByEmail(email: string): Promise<any | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
        const updateData: any = {};

        if (updateUserDto.email) updateData.email = updateUserDto.email;
        if (updateUserDto.firstName) updateData.firstName = updateUserDto.firstName;
        if (updateUserDto.lastName) updateData.lastName = updateUserDto.lastName;
        if (updateUserDto.phoneNumber) updateData.phoneNumber = updateUserDto.phoneNumber;
        if (updateUserDto.department) updateData.department = updateUserDto.department;
        if (updateUserDto.roles) updateData.roles = updateUserDto.roles;
        if (updateUserDto.password) {
            updateData.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                department: true,
                roles: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }
} 