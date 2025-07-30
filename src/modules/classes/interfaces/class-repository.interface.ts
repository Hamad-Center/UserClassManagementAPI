import { CreateClassDto } from "../dto/create-class.dto";
import { UpdateClassDto } from "../dto/update-class.dto";
import { AssignUserToClassDto } from "../dto/assign-user-to-class.dto";
import { IClass, IUserClassAssignment } from "../interfaces/class.interface";

export interface IClassRepository {
    create(createClassDto: CreateClassDto): Promise<IClass>;
    findAll(): Promise<IClass[]>;
    findOne(id: number): Promise<IClass>;
    update(id: number, updateClassDto: UpdateClassDto): Promise<IClass>;
    delete(id: number): Promise<void>;

    // User-Class Assignment methods
    assignUserToClass(assignmentDto: AssignUserToClassDto): Promise<IUserClassAssignment>;
    unAssignUserFromClass(userId: number, classId: number): Promise<void>;
    getUserAssignments(userId: number): Promise<IUserClassAssignment[]>;
    getClassAssignments(classId: number): Promise<IUserClassAssignment[]>;
    getActiveClassAssignments(classId: number): Promise<IUserClassAssignment[]>;
}