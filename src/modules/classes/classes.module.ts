// src/modules/classes/classes.module.ts (QUICK FIX)
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ClassesController } from './controllers/classes.controller';
import { ClassEventsController } from './controllers/class-events.controller';
import { ClassesService } from './services/classes.service';
import { BatchProcessorService } from './services/batch-processor.service';
import { EventPublisherService } from '../../common/events/event-publisher.service';
import { ClassesRepository } from './repositories/classes.repository';
import { PrismaService } from '../../database/prisma/prisma.service';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'REDIS_CLIENT',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => {
                    const redisHost = configService.get<string>('REDIS_HOST', 'redis');
                    const redisPortStr = configService.get<string>('REDIS_PORT', '6379');
                    const redisPort = parseInt(redisPortStr, 10);

                    return {
                        transport: Transport.REDIS,
                        options: {
                            host: redisHost,
                            port: redisPort,
                            retryAttempts: 5,
                            retryDelay: 3000,
                            connectTimeout: 10000,
                            lazyConnect: true,
                            enableOfflineQueue: false,
                        },
                    };
                },
                inject: [ConfigService],
            }
        ]),
    ],
    controllers: [
        ClassesController,
        ClassEventsController,
    ],
    providers: [
        ClassesService,
        BatchProcessorService,
        EventPublisherService,
        ClassesRepository,
        PrismaService,
        {
            provide: 'IClassRepository',
            useClass: ClassesRepository,
        }
    ],
    exports: [ClassesService],
})
export class ClassesModule { }
