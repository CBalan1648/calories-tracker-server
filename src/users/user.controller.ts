import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserLevelValidation } from '..//helpers/userLevel.decorator';
import { AuthService } from '../auth/auth.service';
import { ADMIN } from '../helpers/userLevel.constants';
import { User } from './user.model';
import { UserService } from './user.service';
import { UserCredentials } from './userCredentials.model';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService, private readonly authService: AuthService) { }

    @Post()
    async createUser(@Body() user: User) {
        return await this.userService.create(user);
    }

    @Post('login')
    async login(@Body() credentials: UserCredentials) {
        return this.authService.login(credentials);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllUsers(@UserLevelValidation(ADMIN) req) {
        return this.userService.findAll();
    }
}
