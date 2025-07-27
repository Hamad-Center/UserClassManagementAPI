// src/modules/classes/controllers/class-events.controller.ts (NEW FILE)
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_PATTERNS } from '../../../common/events/event.patterns';
import {
    UserAssignedToClassEvent,
    BatchAssignmentStartedEvent,
    BatchAssignmentCompletedEvent
} from '../../../common/events/class-assignment.events';

@Controller()
export class ClassEventsController {
    private readonly logger = new Logger(ClassEventsController.name);

    @EventPattern(EVENT_PATTERNS.USER_ASSIGNED_TO_CLASS)
    async handleUserAssignedToClass(
        @Payload() event: UserAssignedToClassEvent,
    ) {
        this.logger.log(` Received USER_ASSIGNED_TO_CLASS event`, {
            eventId: event.eventId,
            correlationId: event.correlationId,
            userId: event.userId,
            classId: event.classId,
            assignedAt: event.assignedAt,
        });

        try {
            await this.sendWelcomeNotification(event);
            await this.updateClassMetrics(event);

            this.logger.log(` Successfully processed USER_ASSIGNED_TO_CLASS event`, {
                eventId: event.eventId,
                correlationId: event.correlationId,
            });
        } catch (error) {
            this.logger.error(` Error processing USER_ASSIGNED_TO_CLASS event`, {
                eventId: event.eventId,
                correlationId: event.correlationId,
                error: error.message,
            });
        }
    }

    @EventPattern(EVENT_PATTERNS.BATCH_ASSIGNMENT_STARTED)
    async handleBatchAssignmentStarted(
        @Payload() event: BatchAssignmentStartedEvent,
    ) {
        this.logger.log(` Received BATCH_ASSIGNMENT_STARTED event`, {
            eventId: event.eventId,
            correlationId: event.correlationId,
            batchId: event.batchId,
            totalItems: event.totalItems,
        });

        try {
            await this.initializeBatchTracking(event);

            this.logger.log(` Successfully processed BATCH_ASSIGNMENT_STARTED event`, {
                eventId: event.eventId,
                batchId: event.batchId,
            });
        } catch (error) {
            this.logger.error(` Error processing BATCH_ASSIGNMENT_STARTED event`, {
                eventId: event.eventId,
                batchId: event.batchId,
                error: error.message,
            });
        }
    }

    @EventPattern(EVENT_PATTERNS.BATCH_ASSIGNMENT_COMPLETED)
    async handleBatchAssignmentCompleted(
        @Payload() event: BatchAssignmentCompletedEvent,
    ) {
        this.logger.log(` Received BATCH_ASSIGNMENT_COMPLETED event`, {
            eventId: event.eventId,
            correlationId: event.correlationId,
            batchId: event.batchId,
            successful: event.successful,
            failed: event.failed,
        });

        try {
            await this.sendBatchCompletionNotification(event);
            await this.updateBatchStatistics(event);

            this.logger.log(` Successfully processed BATCH_ASSIGNMENT_COMPLETED event`, {
                eventId: event.eventId,
                batchId: event.batchId,
            });
        } catch (error) {
            this.logger.error(`Error processing BATCH_ASSIGNMENT_COMPLETED event`, {
                eventId: event.eventId,
                batchId: event.batchId,
                error: error.message,
            });
        }
    }

    // Business logic methods (implement as needed)
    private async sendWelcomeNotification(event: UserAssignedToClassEvent) {
        this.logger.debug(` Sending welcome notification`, {
            userId: event.userId,
            classId: event.classId,
        });
        // TODO: Implement notification logic
    }

    private async updateClassMetrics(event: UserAssignedToClassEvent) {
        this.logger.debug(` Updating class metrics`, {
            classId: event.classId,
        });
        // TODO: Implement metrics logic
    }

    private async initializeBatchTracking(event: BatchAssignmentStartedEvent) {
        this.logger.debug(`Initializing batch tracking`, {
            batchId: event.batchId,
            totalItems: event.totalItems,
        });
        // TODO: Implement batch tracking logic
    }

    private async sendBatchCompletionNotification(event: BatchAssignmentCompletedEvent) {
        this.logger.debug(` Sending batch completion notification`, {
            batchId: event.batchId,
            successful: event.successful,
            failed: event.failed,
        });
        // TODO: Implement notification logic
    }

    private async updateBatchStatistics(event: BatchAssignmentCompletedEvent) {
        this.logger.debug(`Updating batch statistics`, {
            batchId: event.batchId,
            successful: event.successful,
            failed: event.failed,
        });
        // TODO: Implement statistics logic
    }
}
