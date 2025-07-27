import { Controller, Get, Param, Post, Patch, Delete, Body, Query, ParseIntPipe, ValidationPipe, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserRole } from '../interfaces/user.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    /*
    * GET /users
    * GET /users/:id
    * POST /users
    * PATCH /users/:id
    * DELETE /users/:id
    */
    constructor(private readonly usersService: UsersService) {}

    @Get() // get /users or /users?role=value
    async findAll(@Query('role') role?: UserRole) {
        return this.usersService.findAll(role);
    }

    @Get(':id') // GET /users/:id
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Post() // POST /users
    async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Patch(':id') // PATCH /users/:id   
    async update(
        @Param('id', ParseIntPipe) id: number, 
        @Body(ValidationPipe) updateUserDto: UpdateUserDto
    ) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id') // DELETE /users/:id   
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.usersService.remove(id);
    }
}