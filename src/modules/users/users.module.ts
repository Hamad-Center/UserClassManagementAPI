import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService], // Export for use in other modules like classes
})
export class UsersModule { } 