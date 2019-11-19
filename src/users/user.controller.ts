import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { User } from './user.model';
import { UserService } from './user.service';
import { UserCredentials } from './userCredentials.model';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService, private readonly authService: AuthService) { }

    @Post()
    async createUser(@Body() user: User) {
        return this.userService.create(user);
    }

    @Post('login')
    async login(@Body() credentials: UserCredentials) {
        return this.authService.login(credentials);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllUsers(@Request() req) {
        return req.user;

        return this.userService.findAll();
    }

}
