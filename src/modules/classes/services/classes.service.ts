import { BadRequestException, Injectable, NotFoundException, Inject } from "@nestjs/common";
import { CreateClassDto } from "../dto/create-class.dto";
import { IClass, IUserClassAssignment } from '../interfaces/class.interface'
import { UpdateClassDto } from "../dto/update-class.dto";
import { AssignUserToClassDto } from "../dto/assign-user-to-class.dto";
import { BatchAssignUsersDto } from "../dto/batch-assign-users.dto";
import { BatchStatus, IBatchJob, IBatchResponse } from "../interfaces/batch.interface";
import { BatchProcessorService } from '../services/batch-processor.service'
import { EventPublisherService } from "src/common/events/event-publisher.service";
import { BatchAssignmentCompletedEvent, BatchAssignmentStartedEvent, UserAssignedToClassEvent } from "src/common/events/class-assignment.events";
import { EVENT_PATTERNS } from "src/common/config/redis.config";
import { IClassRepository } from '../interfaces/class-repository.interface';
import { plainToClass } from 'class-transformer';
import { ClassResponseDto } from '../dto/class-response.dto';
import { AssignmentResponseDto } from '../dto/assignment-response.dto';

@Injectable()
export class ClassesService {
    constructor(
        @Inject('IClassRepository') private readonly classRepository: IClassRepository,
        private readonly batchProcessor: BatchProcessorService,
        private readonly eventPublisher: EventPublisherService,
    ) { }

    async create(createClassDto: CreateClassDto): Promise<ClassResponseDto> {
        const newClass = await this.classRepository.create(createClassDto);
        console.log('Class created', { classId: newClass.id, context: 'ClassesService' });
        return plainToClass(ClassResponseDto, newClass, { excludeExtraneousValues: true });
    }

    async findAll(): Promise<ClassResponseDto[]> {
        const classes = await this.classRepository.findAll();
        return plainToClass(ClassResponseDto, classes, { excludeExtraneousValues: true });
    }

    async findOne(id: number): Promise<ClassResponseDto> {
        try {
            const classData = await this.classRepository.findOne(id);
            return plainToClass(ClassResponseDto, classData, { excludeExtraneousValues: true });
        } catch (error) {
            console.error(`the requested info ${id} is not found`, { context: 'ClassesService' });
            throw new NotFoundException(`class with id ${id} is not found...`);
        }
    }

    async update(id: number, updateClassDto: UpdateClassDto): Promise<ClassResponseDto> {
        try {
            const updatedClass = await this.classRepository.update(id, updateClassDto);
            return plainToClass(ClassResponseDto, updatedClass, { excludeExtraneousValues: true });
        } catch (error) {
            throw new NotFoundException(`class with id ${id} is not found`);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.classRepository.delete(id);
        } catch (error) {
            throw new NotFoundException(`class with specific id ${id} is not found.`);
        }
    }

    // this is the user class core business logic 
    async assignUserToClass(assignmentDto: AssignUserToClassDto): Promise<AssignmentResponseDto> {
        try {
            const assignment = await this.classRepository.assignUserToClass(assignmentDto);

            // publish an event after successful assignment
            const correlationId =
                `assgning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const event = new UserAssignedToClassEvent(
                correlationId,
                assignmentDto.userId,
                assignmentDto.classId,
                assignment.assignedAt
            );

            await this.eventPublisher.publishEvent(EVENT_PATTERNS.USER_ASSIGNED_TO_CLASS, event);

            return plainToClass(AssignmentResponseDto, assignment, { excludeExtraneousValues: true });
        } catch (error) {
            if (error.message.includes('already assigned')) {
                throw new BadRequestException(error.message);
            }
            if (error.message.includes('full capacity')) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    async unAssignUserFromClass(userId: number, classId: number): Promise<void> {
        try {
            await this.classRepository.unAssignUserFromClass(userId, classId);
        } catch (error) {
            throw new NotFoundException('assignment not found');
        }
    }

    async getUserAssignments(userId: number): Promise<AssignmentResponseDto[]> {
        const assignments = await this.classRepository.getUserAssignments(userId);
        return plainToClass(AssignmentResponseDto, assignments, { excludeExtraneousValues: true });
    }

    async getClassAssignments(classId: number): Promise<AssignmentResponseDto[]> {
        const assignments = await this.classRepository.getClassAssignments(classId);
        return plainToClass(AssignmentResponseDto, assignments, { excludeExtraneousValues: true });
    }

    async processBatchAssignments(batchDto: BatchAssignUsersDto): Promise<IBatchResponse> {
        if (batchDto.assignments.length > 1000) {
            throw new BadRequestException(`batch size cannot exceed 1000 assignments`);
        }

        if (batchDto.assignments.length === 0) {
            throw new BadRequestException(`batch must contain at least 1 assignment`);
        }

        const batchId = batchDto.correlationId || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('Creating batch job', {
            batchId,
            count: batchDto.assignments.length,
            context: 'ClassesService'
        });

        const correlationId = batchDto.correlationId || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startedEvent = new BatchAssignmentStartedEvent(
            correlationId, batchId, batchDto.assignments.length
        );
        await this.eventPublisher.publishEvent(EVENT_PATTERNS.BATCH_ASSIGNMENT_STARTED, startedEvent);
        const job = this.batchProcessor.createBatchJob(batchId, batchDto.assignments.length);

        this.batchProcessor.processBatchInBackground(
            batchId,
            batchDto.assignments,
            async (assignment) => {
                // this is where the actual assignment happens 
                await this.assignUserToClass(assignment);
            }
        ).then(
            async () => {
                const completedJob = this.batchProcessor.getBatchJob(batchId);
                if (completedJob) {
                    const completedEvent = new BatchAssignmentCompletedEvent(
                        correlationId,
                        batchId,
                        completedJob.successCount,
                        completedJob.errorCount
                    );
                    await this.eventPublisher.publishEvent(EVENT_PATTERNS.BATCH_ASSIGNMENT_COMPLETED, completedEvent);
                }
            }
        )
            .catch(error => {
                console.error(`batch ${batchId} processing failed: `, error);
            });

        // estimated time for the batch to complete  
        const estimatedMs = batchDto.assignments.length * 100;
        const estimatedCompletion = new Date(Date.now() + estimatedMs).toString();

        return {
            message: 'batch processing started successfully and has been accepted for processing.',
            batchId,
            status: BatchStatus.PENDING,
            totalItems: batchDto.assignments.length,
            estimatedCompletionTime: estimatedCompletion
        };
    }

    async getBatchStatus(batchId: string): Promise<IBatchJob> {
        const job = this.batchProcessor.getBatchJob(batchId);
        if (!job) {
            throw new NotFoundException(`batch job ${batchId} not found`);
        }
        return job;
    }

    async getAllBatchJobs(): Promise<IBatchJob[]> {
        return this.batchProcessor.getAllBatchJob();
    }

    async cleanUpOldBatches(): Promise<number> {
        const jobs = this.batchProcessor.getAllBatchJob();
        console.log(`cleaning old batches started...`, {
            totalJobs: jobs.length,
            context: 'ClassesService'
        });
        return this.batchProcessor.cleanUpOldJobs();
    }

    async cleanUpCompletedBatches(): Promise<number> {
        const jobs = this.batchProcessor.getAllBatchJob();
        console.log(`cleaning completed batches started...`, {
            totalJobs: jobs.length,
            context: 'ClassesService'
        });
        return this.batchProcessor.cleanUpCompletedJobs();
    }

    async cleanUpAllBatches(): Promise<number> {
        const jobs = this.batchProcessor.getAllBatchJob();
        console.log(`cleaning all batches started...`, {
            totalJobs: jobs.length,
            context: 'ClassesService'
        });
        return this.batchProcessor.cleanUpAllJobs();
    }
}
