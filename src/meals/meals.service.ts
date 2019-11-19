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
        console.log(user);
        return await this.userModel.update({ email: user.email }, {
            $push: {
                meals: meal,
            },
        });
    }

    async updateMeal(user: User, meal: Meal): Promise<Meal> {
        return await this.userModel.update({ 'email': user.email, 'meals._id': meal._id }, {
            $set: {
                'meals.$': meal,
            },
        });
    }

    async getMeals(user: User): Promise<Meal[]> {
        return await this.userModel.find({ email: user.email }, { meals: { $slice: [0, 2] } });
    }

    async deleteMeal(user: User, meal: Meal): Promise<Meal> {
        return await this.userModel.update({ email: user.email }, { $pull: { meals: { _id: meal._id } } });
    }

}
