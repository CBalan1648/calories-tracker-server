import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/user.model';
import { Meal } from './meals.model';

@Injectable()
export class MealsService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
    ) { }

    async addMeal(user: User, meal: Meal): Promise<Meal> {
        const updatedUserCursor = await this.userModel.findOneAndUpdate({ email: user.email }, {
            $push: {
                meals: meal,
            },
        }, { new: true, fields: { meals: { $slice: -1 } } });

        return updatedUserCursor.meals[0];
    }

    async updateMeal(user: User, meal: Meal): Promise<Meal> {
        return await this.userModel.updateOne({ 'email': user.email, 'meals._id': meal._id }, {
            $set: {
                'meals.$': meal,
            },
        });
    }

    async getMeals(user: User): Promise<Meal[]> {
        return await this.userModel.findOne({ email: user.email }, { meals: 1 }, { omitUndefined: true });
    }

    async deleteMeal(user: User, mealId: string): Promise<Meal> {
        return await this.userModel.update({ email: user.email }, { $pull: { meals: { _id: mealId } } });
    }

}
