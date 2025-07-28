import { Expose, Transform } from 'class-transformer';
import { UserRole } from '../entities/user-role.enum';

export class UserResponseDto {
    @Expose()
    id: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    email: string;

    @Expose()
    phoneNumber?: string;

    @Expose()
    department?: string;

    @Expose()
    roles: UserRole[];

    @Expose()
    @Transform(({ value }) => value?.toISOString())
    createdAt: Date;

    @Expose()
    @Transform(({ value }) => value?.toISOString())
    updatedAt: Date;

    // Computed property for full name
    @Expose()
    @Transform(({ obj }) => `${obj.firstName} ${obj.lastName}`)
    fullName: string;
} 