import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DbResponse } from '../helpers/db-response.model';
import { User } from '../users/models/user.model';
import { Meal } from './models/meals.model';
import { USER_NOT_FOUND } from '../helpers/strings';

@Injectable()
export class MealsService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
    ) { }

    async addMeal(userId: string, meal: Meal): Promise<Meal> {
        const updatedUserCursor = await this.userModel.findOneAndUpdate({ _id: userId }, {
            $push: {
                meals: meal,
            },
        }, { new: true, fields: { meals: { $slice: -1 } } });

        if (updatedUserCursor === null) {
            throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        return updatedUserCursor.meals[0];
    }

    async updateMeal(userId: string, mealId: string, meal: Meal): Promise<DbResponse> {

        const { description, title, time, calories } = meal;

        const response = await this.userModel.updateOne({ '_id': userId, 'meals._id': mealId }, {
            $set: {
                'meals.$.description': description,
                'meals.$.title': title,
                'meals.$.time': time,
                'meals.$.calories': calories,
            },
        });

        if (response.n === 0) {
            throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        return response;
    }

    async getMeals(userId: string): Promise<{ _id: string, meals: Meal[] }> {
        const userMeals = await this.userModel.findOne({ _id: userId }, { meals: 1 }, { omitUndefined: true });
        if (userMeals === null) {
            throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return userMeals;
    }

    async deleteMeal(userId: string, mealId: string): Promise<DbResponse> {
        const response = await this.userModel.update({ _id: userId }, { $pull: { meals: { _id: mealId } } });
        if (response.n === 0) {
            throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return response;
    }
}
