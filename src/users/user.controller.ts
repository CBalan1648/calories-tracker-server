import { Controller, Get, Post, Body } from '@nestjs/common';
import { User } from './user.model';
import { UserService } from './user.service';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Get()
    async getAllUsers() {
        return this.userService.findAll();
    }

    @Post()
    async addUser(@Body() user: User) {
        return this.userService.create(user);
    }
}
