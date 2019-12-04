import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/models/user.model';
import { Meal } from './models/meals.model';
import { MealPostBody } from './models/meal-post-body.model';
import { DbResponse } from '../helpers/db-response.model';

@Injectable()
export class MealsService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
    ) { }

    async addMeal(userId: string, meal: MealPostBody): Promise<Meal> {
        const updatedUserCursor = await this.userModel.findOneAndUpdate({ _id: userId }, {
            $push: {
                meals: meal,
            },
        }, { new: true, fields: { meals: { $slice: -1 } } });

        return updatedUserCursor.meals[0];
    }

    async updateMeal(userId: string, mealId: string, meal: Meal): Promise<DbResponse> {
        return await this.userModel.updateOne({ '_id': userId, 'meals._id': mealId }, {
            $set: {
                'meals.$': meal,
            },
        });
    }

    async getMeals(userId: string): Promise<Meal[]> {
        return await this.userModel.findOne({ _id: userId }, { meals: 1 }, { omitUndefined: true });
    }

    async deleteMeal(userId: string, mealId: string): Promise<DbResponse> {
        return await this.userModel.update({ _id: userId }, { $pull: { meals: { _id: mealId } } });
    }

}
