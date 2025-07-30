export interface IClass {
    id: number;
    name: string;
    capacity: number;
    description?: string;
    currentEnrollment?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserClassAssignment {
    id: number;
    userId: number;
    classId: number;
    assignedAt: Date;
    status: 'ACTIVE' | 'INACTIVE';
} 