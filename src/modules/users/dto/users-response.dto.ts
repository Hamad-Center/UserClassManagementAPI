import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from './user-response.dto';

export class UsersResponseDto {
    @Expose()
    @Type(() => UserResponseDto)
    users: UserResponseDto[];

    @Expose()
    total: number;

    @Expose()
    page: number;

    @Expose()
    limit: number;

    @Expose()
    totalPages: number;
} 