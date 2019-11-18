import { Controller, Get, Post, Body } from '@nestjs/common';
import { User } from './user.model';
import { UserService } from './user.service';
import { UserCredentials } from './userCredentials.model';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post()
    async createUser(@Body() user: User) {
        return this.userService.create(user);
    }

    @Post('login')
    async login(@Body() credentials: UserCredentials) {
        return this.userService.loginUser(credentials);
    }

    @Get()
    async getAllUsers() {
        return this.userService.findAll();
    }

}
