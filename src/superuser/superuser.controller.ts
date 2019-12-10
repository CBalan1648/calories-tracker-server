import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { DbResponse } from '../helpers/db-response.model';
import { MealsService } from '../meals/meals.service';
import { User } from '../users/models/user.model';
import { UserService } from '../users/user.service';

@ApiBearerAuth()
@ApiTags('Superuser')
@Controller('api/users')
export class SuperuserController {

    constructor(private readonly userService: UserService, private readonly mealsService: MealsService) { }

    // TODO : Add insuficient privileges documentation
    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Returns all User records' })
    async getAllUsers(): Promise<User[]> {
        return this.userService.findAll();
    }

    // TODO : Add insuficient privileges documentation
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({ summary: 'Delete user - Returns number of modified items' })
    @ApiParam({ name: 'id', description: 'Target user id', required: true })
    async deleteUser(@Param() paramters): Promise<DbResponse> {
        return this.userService.delete(paramters.id);
    }

    // TODO : Add insuficient privileges documentation
    // ! : Handle difference between user and admin on update request
    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    @ApiOperation({ summary: 'Update user record - Returns number of modified items' })
    @ApiParam({ name: 'id', description: 'Target user id', required: true })
    async updateUserWithPrivileges(@Body() body: User, @Param() parameters): Promise<DbResponse> {
        return this.userService.updateWithPrivileges(parameters.id, body);
    }


    // TODO : Add unauthorized documentation
    // ! : Handle case when a non admin user is requesting another record than his own
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    @ApiOperation({ summary: 'Returns target User record' })
    @ApiParam({ name: 'id', description: 'Target user id', required: true })
    async getUser(@Param() parameters) {
        return this.userService.findUser(parameters.id);
    }

}
