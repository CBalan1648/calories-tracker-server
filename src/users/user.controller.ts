import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DbResponse } from '../helpers/db-response.model';
import { Parameters } from '../helpers/parameters.models';
import { BAD_REQUEST, CREATE_USER_ADMIN, DELETE_USER, GET_USER, GET_USERS, INSUFFICIENT_PRIVILEGES, JWT_NOT_VALID, PUT_USER, USER_ID_DESCRIPTION } from '../helpers/strings';
import { ADMIN, SELF, USER, USER_MANAGER } from '../helpers/userLevel.constants';
import { Roles } from '../helpers/userLevel.decorator';
import { UserLevelGuard } from '../helpers/userLevel.guard';
import { UserRegistrationBodyDto } from './models/user-registration-body.model';
import { User } from './models/user.model';
import { UserService } from './user.service';

@UseGuards(AuthGuard('jwt'), UserLevelGuard)
@ApiBearerAuth()
@ApiTags('Users')
@Controller('api/users')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post()
    @ApiOperation({ summary: CREATE_USER_ADMIN })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @Roles(ADMIN)
    async createUser(@Body() user: UserRegistrationBodyDto): Promise<User> {
        return await this.userService.createNewUserWithPrivileges(user);
    }

    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @Get()
    @Roles(USER_MANAGER, ADMIN)
    @ApiOperation({ summary: GET_USERS })
    async getAllUsers(): Promise<User[]> {
        return this.userService.findAll();
    }

    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @Delete(':id')
    @ApiOperation({ summary: DELETE_USER })
    @ApiParam({ name: 'id', description: USER_ID_DESCRIPTION, required: true })
    @Roles(ADMIN)
    async deleteUser(@Param() parameters: Parameters): Promise<DbResponse> {
        return this.userService.delete(parameters.id);
    }

    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @Put(':id')
    @ApiOperation({ summary: PUT_USER })
    @ApiParam({ name: 'id', description: USER_ID_DESCRIPTION, required: true })
    @Roles(SELF, ADMIN)
    async updateUser(@Request() request, @Body() body: User, @Param() parameters: Parameters): Promise<DbResponse> {

        if (request.user.authLevel === USER) {
            return this.userService.update(parameters.id, body);
        } else {
            return this.userService.updateWithPrivileges(parameters.id, body);
        }
    }

    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @Get(':id')
    @ApiOperation({ summary: GET_USER })
    @ApiParam({ name: 'id', description: USER_ID_DESCRIPTION, required: true })
    @Roles(USER_MANAGER, ADMIN)
    async getUser(@Param() parameters: Parameters) {
        return this.userService.findUser(parameters.id);
    }
}
