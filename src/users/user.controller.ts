import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { UserCredentialsDto } from './models/user-credentials.model';
import { UserRegistrationBodyDto } from './models/user-registration-body.model';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginJwt } from 'src/auth/models/login-jwt.model';

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

    // @UseGuards(AuthGuard('jwt'))
    // @Put(':id')
    // async updateUser(@Body() user: User, @Param() parameters) {
    //     return await this.userService.update(parameters.id, user);
    // }
}
