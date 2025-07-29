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
                roleAssignments: {
                    create: (createUserDto.roles || [UserRole.USER]).map(role => ({
                        role: role
                    }))
                }
            },
            include: {
                roleAssignments: true
            }
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
                roleAssignments: {
                    select: {
                        role: true
                    }
                },
                createdAt: true,
                updatedAt: true,
            },
        });

        // Filter by role if specified
        if (role) {
            return users.filter((user: any) =>
                user.roleAssignments.some((assignment: any) => assignment.role === role)
            );
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
                roleAssignments: {
                    select: {
                        role: true
                    }
                },
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
        if (updateUserDto.password) {
            updateData.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        // Handle role updates separately
        if (updateUserDto.roles) {
            // Delete existing role assignments
            await this.prisma.userRoleAssignment.deleteMany({
                where: { userId: id }
            });

            // Create new role assignments
            updateData.roleAssignments = {
                create: updateUserDto.roles.map(role => ({
                    role: role
                }))
            };
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
                roleAssignments: {
                    select: {
                        role: true
                    }
                },
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