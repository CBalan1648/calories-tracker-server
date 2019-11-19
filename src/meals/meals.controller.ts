import { Body, Controller, Delete, Get, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Meal } from './meals.model';
import { MealsService } from './meals.service';

@Controller('meals')
export class MealsController {

    constructor(private readonly mealsService: MealsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async addMeal(@Request() request, @Body() meal: Meal) {
        return this.mealsService.addMeal(request.user, meal);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put()
    async updateMeal(@Request() request, @Body() meal: Meal) {
        return this.mealsService.updateMeal(request.user, meal);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getMeals(@Request() request) {
        return this.mealsService.getMeals(request.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete()
    async deleteMeal(@Request() request, @Body() meal: Meal) {
        return this.mealsService.deleteMeal(request.user, meal);
    }
}
