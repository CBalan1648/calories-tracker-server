import { Body, Controller, Delete, Get, Post, Put, Request, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Meal } from './meals.model';
import { MealsService } from './meals.service';

@Controller('api/users')
export class MealsController {

    constructor(private readonly mealsService: MealsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/meals')
    async addMeal(@Param() parameters, @Body() meal: Meal) {
        return this.mealsService.addMeal(parameters.id, meal);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id/meals/:mealId')
    async updateMeal(@Body() meal: Meal, @Param() parameters) {
        return this.mealsService.updateMeal(parameters.id, parameters.mealId, meal);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/meals')
    async getMeals(@Param() parameters) {
        return this.mealsService.getMeals(parameters.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id/meals/:mealId')
    async deleteMeal(@Param() parameters) {
        return this.mealsService.deleteMeal(parameters.id, parameters.mealId);
    }
}
