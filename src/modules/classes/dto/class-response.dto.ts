import { Expose, Transform } from 'class-transformer';

export class ClassResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    description?: string;

    @Expose()
    capacity: number;

    @Expose()
    currentEnrollment: number;

    @Expose()
    @Transform(({ value }) => value?.toISOString())
    createdAt: Date;

    @Expose()
    @Transform(({ value }) => value?.toISOString())
    updatedAt: Date;

    // Computed property for availability
    @Expose()
    @Transform(({ obj }) => obj.capacity - obj.currentEnrollment)
    availableSpots: number;

    // Computed property for enrollment percentage
    @Expose()
    @Transform(({ obj }) => Math.round((obj.currentEnrollment / obj.capacity) * 100))
    enrollmentPercentage: number;
} 