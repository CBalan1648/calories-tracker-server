import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Meal } from '../meals/meals.model';
import { MealsService } from '../meals/meals.service';
import { UserService } from '../users/user.service';

@Controller('api/users')
export class SuperuserController {

    constructor(private readonly userService: UserService, private readonly mealsService: MealsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllUsers() {
        return this.userService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteUser(@Param() paramters) {
        return this.userService.delete(paramters.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    async updateUserWithPrivileges(@Body() body, @Param() parameters) {
        return this.userService.updateWithPrivileges(parameters.id, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async getUser(@Param() paramters) {
        return this.userService.findUser(paramters.id);
    }

}
