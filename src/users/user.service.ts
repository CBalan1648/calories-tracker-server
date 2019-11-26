import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';

@Injectable()
export class UserService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

    async create(user: User): Promise<User> {
        const createdUser = await new this.userModel(user).save();
        const { password, ...userData } = createdUser.toObject();
        return userData;
    }

    async findAll(): Promise<User[]> {
        return await this.userModel.find({}, { meals: 0, password: 0 }).exec();
    }

    async update(id, user): Promise<User> {
        return await this.userModel.updateOne({ _id: id }, {
            $set: {
                firstName: user.firstName,
                lastName: user.lastName,
                targetCalories: user.targetCalories,
            },
        });
    }

    async updateWithPrivileges(id, user): Promise<User> {
        return await this.userModel.updateOne({ _id: id }, {
            $set: {
                firstName: user.firstName,
                lastName: user.lastName,
                targetCalories: user.targetCalories,
                authLevel: user.authLevel,
            },
        });
    }

    async delete(id: string): Promise<any> {
        return await this.userModel.deleteOne({ _id: id });
    }

    async findUser(id: string): Promise<User> {
        return await this.userModel.find({ _id: id });
    }
}
