import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { IClassRepository } from '../interfaces/class-repository.interface';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { IClass, IUserClassAssignment } from '../interfaces/class.interface';
import { AssignUserToClassDto } from '../dto/assign-user-to-class.dto';

@Injectable()
export class ClassesRepository implements IClassRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(createClassDto: CreateClassDto): Promise<IClass> {
        const newClass = await this.prisma.class.create({
            data: {
                name: createClassDto.name,
                capacity: createClassDto.capacity,
                description: createClassDto.description,
            },
        });

        return {
            id: newClass.id,
            name: newClass.name,
            capacity: newClass.capacity,
            description: newClass.description || undefined,
            createdAt: newClass.createdAt,
            updatedAt: newClass.updatedAt,
        };
    }

    async findAll(): Promise<IClass[]> {
        const classes = await this.prisma.class.findMany();

        return classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            capacity: cls.capacity,
            description: cls.description || undefined,
            createdAt: cls.createdAt,
            updatedAt: cls.updatedAt,
        }));
    }

    async findOne(id: number): Promise<IClass> {
        const classItem = await this.prisma.class.findUnique({
            where: { id },
        });

        if (!classItem) {
            throw new Error(`Class with id ${id} not found`);
        }

        return {
            id: classItem.id,
            name: classItem.name,
            capacity: classItem.capacity,
            description: classItem.description || undefined,
            createdAt: classItem.createdAt,
            updatedAt: classItem.updatedAt,
        };
    }

    async update(id: number, updateClassDto: UpdateClassDto): Promise<IClass> {
        const updatedClass = await this.prisma.class.update({
            where: { id },
            data: {
                name: updateClassDto.name,
                capacity: updateClassDto.capacity,
                description: updateClassDto.description,
            },
        });

        return {
            id: updatedClass.id,
            name: updatedClass.name,
            capacity: updatedClass.capacity,
            description: updatedClass.description || undefined,
            createdAt: updatedClass.createdAt,
            updatedAt: updatedClass.updatedAt,
        };
    }

    async delete(id: number): Promise<void> {
        await this.prisma.class.delete({
            where: { id },
        });
    }

    // User-Class Assignment methods
    async assignUserToClass(assignmentDto: AssignUserToClassDto): Promise<IUserClassAssignment> {
        // Check if assignment already exists
        const existingAssignment = await this.prisma.userClassAssignment.findFirst({
            where: {
                userId: assignmentDto.userId,
                classId: assignmentDto.classId,
                status: 'ACTIVE',
            },
        });

        if (existingAssignment) {
            throw new Error(`User with id ${assignmentDto.userId} is already assigned to this class`);
        }

        // Check class capacity
        const classItem = await this.findOne(assignmentDto.classId);
        const currentAssignments = await this.prisma.userClassAssignment.count({
            where: {
                classId: assignmentDto.classId,
                status: 'ACTIVE',
            },
        });

        if (currentAssignments >= classItem.capacity) {
            throw new Error('Class is at full capacity');
        }

        const assignment = await this.prisma.userClassAssignment.create({
            data: {
                userId: assignmentDto.userId,
                classId: assignmentDto.classId,
                status: assignmentDto.status || 'ACTIVE',
            },
        });

        return {
            id: assignment.id,
            userId: assignment.userId,
            classId: assignment.classId,
            assignedAt: assignment.assignedAt,
            status: assignment.status,
        };
    }

    async unAssignUserFromClass(userId: number, classId: number): Promise<void> {
        const assignment = await this.prisma.userClassAssignment.findFirst({
            where: {
                userId,
                classId,
                status: 'ACTIVE',
            },
        });

        if (!assignment) {
            throw new Error('Assignment not found');
        }

        await this.prisma.userClassAssignment.update({
            where: { id: assignment.id },
            data: { status: 'INACTIVE' },
        });
    }

    async getUserAssignments(userId: number): Promise<IUserClassAssignment[]> {
        const assignments = await this.prisma.userClassAssignment.findMany({
            where: { userId },
        });

        return assignments.map(assignment => ({
            id: assignment.id,
            userId: assignment.userId,
            classId: assignment.classId,
            assignedAt: assignment.assignedAt,
            status: assignment.status,
        }));
    }

    async getClassAssignments(classId: number): Promise<IUserClassAssignment[]> {
        const assignments = await this.prisma.userClassAssignment.findMany({
            where: { classId },
        });

        return assignments.map(assignment => ({
            id: assignment.id,
            userId: assignment.userId,
            classId: assignment.classId,
            assignedAt: assignment.assignedAt,
            status: assignment.status,
        }));
    }

    async getActiveClassAssignments(classId: number): Promise<IUserClassAssignment[]> {
        const assignments = await this.prisma.userClassAssignment.findMany({
            where: {
                classId,
                status: 'ACTIVE',
            },
        });

        return assignments.map(assignment => ({
            id: assignment.id,
            userId: assignment.userId,
            classId: assignment.classId,
            assignedAt: assignment.assignedAt,
            status: assignment.status,
        }));
    }
} 