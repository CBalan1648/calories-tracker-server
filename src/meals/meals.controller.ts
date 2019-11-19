import { Controller, Post, Body, Put, Delete, Get } from '@nestjs/common';
import { MealsService } from './meals.service';
import { Meal } from './meals.model';

@Controller('meals')
export class MealsController {

    constructor(private readonly mealsService: MealsService) { }

    @Post()
    async addMeal(@Body() meal: Meal) {
        return this.mealsService.addMeal({
            _id: '5dd2a08a381ad70e284f8ab2',
            firstName: 'Catalin',
            lastName: 'Balan',
            email: 'asdasd@fakeEmail.com',
        }, meal);
    }

    @Put()
    async updateMeal(@Body() meal: Meal) {
        return this.mealsService.updateMeal({
            _id: '5dd3b33c20d1ff1f483deaae',
            firstName: 'Catalin',
            lastName: 'Balan',
            email: 'asdasd@fakeEmail.com',
        }, meal);
    }
    @Get()
    async getMeals() {
        return this.mealsService.getMeals({
            _id: '55dd3b33c20d1ff1f483deaae',
            firstName: 'Catalin',
            lastName: 'Balan',
            email: 'asdasd@fakeEmail.com',
        });
    }
    @Delete()
    async deleteMeal(@Body() meal: Meal) {
        return this.mealsService.deleteMeal({
            _id: '5dd3b33c20d1ff1f483deaae',
            firstName: 'Catalin',
            lastName: 'Balan',
            email: 'asdasd@fakeEmail.com',
        }, meal);
    }
}
