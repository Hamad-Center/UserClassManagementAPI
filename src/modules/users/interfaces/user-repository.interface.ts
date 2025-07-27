import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
// import { UserRole } from '@prisma/client';
import { UserRole } from './user.interface';
export interface IUser {
    id: number;
    name: string;
    email: string;
    // role: 'INTERN' | 'ADMIN' | 'ENGINEER';
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserRepository {
    create(createUserDto: CreateUserDto): Promise<IUser>;
    findAll(role?: UserRole): Promise<IUser[]>;
    findOne(id: number): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<IUser>;
    delete(id: number): Promise<void>;
} 