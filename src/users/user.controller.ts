import { Body, Controller, Post, UseGuards, Put, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginJwt } from '../auth/models/login-jwt.model';
import { AuthService } from '../auth/auth.service';
import { UserCredentialsDto } from './models/user-credentials.model';
import { UserRegistrationBodyDto } from './models/user-registration-body.model';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/users')
export class UserController {

    constructor(private readonly userService: UserService, private readonly authService: AuthService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new User - Returns created record' })
    async createUser(@Body() user: UserRegistrationBodyDto): Promise<User> {
        return await this.userService.createNewUser(user);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login against the DB - Returns JWT' })
    @ApiResponse({ status: 404, description: 'User is not found' })
    async login(@Body() credentials: UserCredentialsDto): Promise<LoginJwt> {
        return this.authService.login(credentials);
    }
}
