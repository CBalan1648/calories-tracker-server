import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DbResponse } from '../helpers/db-response.model';
import { BAD_REQUEST, DELETE_MEAL, GET_MEALS, ID_USER_NOT_FOUND, INSUFFICIENT_PRIVILEGES, JWT_NOT_VALID, MEAL_ID_DESCRIPTION, POST_MEAL, PUT_MEAL, USER_ID_DESCRIPTION } from '../helpers/strings';
import { ADMIN, SELF, USER_MANAGER } from '../helpers/userLevel.constants';
import { Roles } from '../helpers/userLevel.decorator';
import { UserLevelGuard } from '../helpers/userLevel.guard';
import { MealsService } from './meals.service';
import { Meal } from './models/meals.model';
import { Parameters } from '../helpers/parameters.models';

@UseGuards(AuthGuard('jwt'), UserLevelGuard)
@ApiTags('Meals')
@ApiBearerAuth()
@Controller('api/users')
export class MealsController {

    constructor(private readonly mealsService: MealsService) { }

    @ApiResponse({ status: 404, description: ID_USER_NOT_FOUND })
    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiOperation({ summary: POST_MEAL })
    @Roles(SELF, USER_MANAGER, ADMIN)
    @Post(':id/meals')
    @ApiParam({ name: 'id', description: USER_ID_DESCRIPTION, required: true })
    async addMeal(@Param() parameters: Parameters, @Body() meal: Meal): Promise<Meal> {
        return this.mealsService.addMeal(parameters.id, meal);
    }

    @ApiResponse({ status: 404, description: ID_USER_NOT_FOUND })
    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @Put(':id/meals/:mealId')
    @ApiOperation({ summary: PUT_MEAL })
    @ApiParam({ name: 'id', description: USER_ID_DESCRIPTION, required: true })
    @ApiParam({ name: 'mealId', description: MEAL_ID_DESCRIPTION, required: true })
    @Roles(SELF, USER_MANAGER, ADMIN)
    async updateMeal(@Param() parameters: Parameters, @Body() meal: Meal): Promise<DbResponse> {
        return this.mealsService.updateMeal(parameters.id, parameters.mealId, meal);
    }

    @ApiResponse({ status: 404, description: ID_USER_NOT_FOUND })
    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @Get(':id/meals')
    @ApiOperation({ summary: GET_MEALS })
    @ApiParam({ name: 'id', description: USER_ID_DESCRIPTION, required: true })
    @Roles(SELF, USER_MANAGER, ADMIN)
    async getMeals(@Param() parameters: Parameters): Promise<{ _id: string, meals: Meal[] }> {
        return this.mealsService.getMeals(parameters.id);
    }

    @ApiResponse({ status: 404, description: ID_USER_NOT_FOUND })
    @ApiResponse({ status: 401, description: JWT_NOT_VALID })
    @ApiResponse({ status: 403, description: INSUFFICIENT_PRIVILEGES })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @Delete(':id/meals/:mealId')
    @ApiOperation({ summary: DELETE_MEAL })
    @ApiParam({ name: 'id', description: USER_ID_DESCRIPTION, required: true })
    @ApiParam({ name: 'mealId', description: MEAL_ID_DESCRIPTION, required: true })
    @Roles(SELF, USER_MANAGER, ADMIN)
    async deleteMeal(@Param() parameters: Parameters): Promise<DbResponse> {
        return this.mealsService.deleteMeal(parameters.id, parameters.mealId);
    }
}
