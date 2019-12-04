import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Meal } from './models/meals.model';
import { MealsService } from './meals.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MealPostBody } from './models/meal-post-body.model';

@ApiBearerAuth()
@Controller('api/users')
export class MealsController {

    constructor(private readonly mealsService: MealsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/meals')
    @ApiOperation({ summary: 'Create a new Meal - Returns created record' })
    @ApiParam({name : 'id', description : 'Target user id', required : true})
    async addMeal(@Param() parameters, @Body() meal: MealPostBody) {
        return this.mealsService.addMeal(parameters.id, meal);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id/meals/:mealId')
    @ApiOperation({ summary: 'Update meal - Returns number of modified items' })
    @ApiParam({name : 'id', description : 'Target user id', required : true})
    @ApiParam({name : 'mealId', description : 'Target meal id', required : true})
    async updateMeal(@Body() meal: Meal, @Param() parameters) {
        return this.mealsService.updateMeal(parameters.id, parameters.mealId, meal);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/meals')
    @ApiOperation({ summary: 'Get user meals - Returns Meals array' })
    @ApiParam({name : 'id', description : 'Target user id', required : true})
    async getMeals(@Param() parameters) {
        return this.mealsService.getMeals(parameters.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id/meals/:mealId')
    @ApiOperation({ summary: 'Update meal - Returns number of modified items' })
    @ApiParam({name : 'id', description : 'Target user id', required : true})
    @ApiParam({name : 'mealId', description : 'Target meal id', required : true})
    async deleteMeal(@Param() parameters) {
        return this.mealsService.deleteMeal(parameters.id, parameters.mealId);
    }
}
