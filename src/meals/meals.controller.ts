import { Body, Controller, Delete, Get, Post, Put, Request, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Meal } from './meals.model';
import { MealsService } from './meals.service';

@Controller('api/meals')
export class MealsController {

    constructor(private readonly mealsService: MealsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async addMeal(@Request() request, @Body() meal: Meal) {
        return this.mealsService.addMeal(request.user._id, meal);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    async updateMeal(@Request() request, @Body() meal: Meal, @Param() parameters) {
        return this.mealsService.updateMeal(request.user._id, parameters.id , meal);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getMeals(@Request() request) {
        return this.mealsService.getMeals(request.user._id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteMeal(@Request() request, @Param() paramters) {
        return this.mealsService.deleteMeal(request.user._id, paramters.id);
    }
}
