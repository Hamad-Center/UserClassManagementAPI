import { Transform } from 'class-transformer';
import { 
    IsString, 
    IsEmail, 
    IsNotEmpty, 
    IsOptional, 
    IsArray, 
    IsIn, 
    MinLength, 
    Matches,
    IsPhoneNumber
} from 'class-validator';
import { UserRole } from '../interfaces/user.interface';

export class CreateUserDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    lastName: string;

    @IsOptional()
    @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsArray()
    @IsIn(Object.values(UserRole), { each: true })
    @Transform(({ value }) => 
        Array.isArray(value) 
            ? [...new Set(value.map(v => v.toUpperCase()))] 
            : [value.toUpperCase()]
    )
    roles?: UserRole[];
}