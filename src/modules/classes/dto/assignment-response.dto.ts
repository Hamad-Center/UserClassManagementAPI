import { Expose, Transform, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { ClassResponseDto } from './class-response.dto';

export class AssignmentResponseDto {
    @Expose()
    id: string;

    @Expose()
    userId: string;

    @Expose()
    classId: string;

    @Expose()
    @Transform(({ value }) => value?.toISOString())
    assignedAt: Date;

    @Expose()
    @Type(() => UserResponseDto)
    user?: UserResponseDto;

    @Expose()
    @Type(() => ClassResponseDto)
    class?: ClassResponseDto;
} 