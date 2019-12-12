import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { LoginJwt } from '../auth/models/login-jwt.model';
import { BAD_REQUEST, CREATE_USER, LOGIN, USER_NOT_FOUND } from '../helpers/strings';
import { UserCredentialsDto } from './models/user-credentials.model';
import { UserRegistrationBodyDto } from './models/user-registration-body.model';
import { User } from './models/user.model';
import { UserService } from './user.service';

@ApiTags('Guest')
@Controller('api')
export class GuestController {

    constructor(private readonly userService: UserService, private readonly authService: AuthService) { }

    @Post('new')
    @ApiOperation({ summary: CREATE_USER })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    async createUser(@Body() user: UserRegistrationBodyDto): Promise<User> {
        return await this.userService.createNewUser(user);
    }

    @Post('login')
    @ApiOperation({ summary: LOGIN })
    @ApiResponse({ status: 404, description: USER_NOT_FOUND })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    async login(@Body() credentials: UserCredentialsDto): Promise<LoginJwt> {
        return this.authService.login(credentials);
    }
}
