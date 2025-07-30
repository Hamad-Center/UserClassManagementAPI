import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { PrismaService } from '../../database/prisma/prisma.service';

@Module({
    controllers: [UsersController],
    providers: [
        UsersService,
        UsersRepository,
        PrismaService,
        {
            provide: 'IUserRepository',
            useClass: UsersRepository,
        }
    ],
    exports: [UsersService], // Export for use in other modules like classes
})
export class UsersModule { } 