// src/app.module.ts (CORRECTED VERSION)
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ClassesModule } from './modules/classes/classes.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventPublisherService } from './common/events/event-publisher.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    UsersModule,
    ClassesModule,
    ClientsModule.registerAsync([
      {
        name: 'REDIS_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const redisHost = configService.get<string>('REDIS_HOST', 'redis');
          const redisPortStr = configService.get<string>('REDIS_PORT', '6379');
          const redisPort = parseInt(redisPortStr, 10);

          console.log('🔧 [ClientsModule] Redis Config:', {
            host: redisHost,
            port: redisPort,
            portString: redisPortStr,
            environment: configService.get('NODE_ENV')
          });

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
            }
          };
        },
        inject: [ConfigService],
      }
    ]),
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EventPublisherService
  ],
  exports: [EventPublisherService],
})
export class AppModule { }
