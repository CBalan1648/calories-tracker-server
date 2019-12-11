import { Body, Controller, Delete, Get, Param, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DELETE_USER, GET_USER, GET_USERS, INSUFFICIENT_PRIVILEGES, JWT_NOT_VALID, PUT_USER, USER_ID_DESCRIPTION } from 'src/helpers/strings';
import { ADMIN, SELF, USER, USER_MANAGER } from 'src/helpers/userLevel.constants';
import { DbResponse } from '../helpers/db-response.model';
import { Roles } from '../helpers/userLevel.decorator';
import { UserLevelGuard } from '../helpers/userLevel.guard';
import { MealsService } from '../meals/meals.service';
import { User } from '../users/models/user.model';
import { UserService } from '../users/user.service';

@UseGuards(AuthGuard('jwt'), UserLevelGuard)
@ApiBearerAuth()
@ApiTags('Superuser')
@Controller('api/users')
export class SuperuserController {

    constructor(private readonly userService: UserService, private readonly mealsService: MealsService) { }

    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @Get()
    @Roles(USER_MANAGER, ADMIN)
    @ApiOperation({ summary: GET_USERS })
    async getAllUsers(): Promise<User[]> {
        return this.userService.findAll();
    }

    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @Delete(':id')
    @ApiOperation({ summary: DELETE_USER })
    @ApiParam({ name: 'id', description: USER_ID_DESCRIPTION, required: true })
    @Roles(USER_MANAGER, ADMIN)
    async deleteUser(@Param() paramters): Promise<DbResponse> {
        return this.userService.delete(paramters.id);
    }

    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @Put(':id')
    @ApiOperation({ summary: PUT_USER })
    @ApiParam({ name: 'id', description: USER_ID_DESCRIPTION, required: true })
    @Roles(SELF, ADMIN)
    async updateUserWithPrivileges(@Request() request, @Body() body: User, @Param() parameters): Promise<DbResponse> {

        if (request.user.authLevel === USER) {
            return this.userService.update(parameters.id, body);
        } else {
            return this.userService.updateWithPrivileges(parameters.id, body);
        }

    }

    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @Get(':id')
    @ApiOperation({ summary: GET_USER })
    @ApiParam({ name: 'id', description: USER_ID_DESCRIPTION, required: true })
    @Roles(USER_MANAGER, ADMIN)
    async getUser(@Param() parameters) {
        return this.userService.findUser(parameters.id);
    }

}
