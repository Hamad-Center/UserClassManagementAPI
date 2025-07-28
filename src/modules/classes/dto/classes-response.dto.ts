import { Expose, Type } from 'class-transformer';
import { ClassResponseDto } from './class-response.dto';

export class ClassesResponseDto {
    @Expose()
    @Type(() => ClassResponseDto)
    classes: ClassResponseDto[];

    @Expose()
    total: number;

    @Expose()
    page: number;

    @Expose()
    limit: number;

    @Expose()
    totalPages: number;
} 