import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DbResponse } from '../helpers/db-response.model';
import { UserRegistrationBodyDto } from './models/user-registration-body.model';
import { User } from './models/user.model';

@Injectable()
export class UserService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

    async createNewUser(user: UserRegistrationBodyDto): Promise<User> {
        const createdUser = await new this.userModel(stripAuthLevel(user)).save();
        return stripPassword(createdUser.toObject());
    }

    async createNewUserWithPrivileges(user: UserRegistrationBodyDto): Promise<User> {
        const createdUser = await new this.userModel(user).save();
        return stripPassword(createdUser.toObject());
    }

    async findAll(): Promise<User[]> {
        return await this.userModel.find({}, { meals: 0, password: 0 }).exec();
    }

    async update(id: string, user: User): Promise<DbResponse> {
        return await this.userModel.updateOne({ _id: id }, {
            $set: {
                firstName: user.firstName,
                lastName: user.lastName,
                targetCalories: user.targetCalories,
            },
        });
    }

    async updateWithPrivileges(id, user): Promise<DbResponse> {
        return await this.userModel.updateOne({ _id: id }, {
            $set: {
                firstName: user.firstName,
                lastName: user.lastName,
                targetCalories: user.targetCalories,
                authLevel: user.authLevel,
            },
        });
    }

    async delete(id: string): Promise<DbResponse> {
        return await this.userModel.deleteOne({ _id: id });
    }

    async findUser(id: string): Promise<User> {
        const findResult = await this.userModel.find({ _id: id });
        return findResult[0];
    }
}

export const stripAuthLevel = (user: UserRegistrationBodyDto): UserRegistrationBodyDto => {
    const { authLevel, ...userBody } = user;
    return userBody;
};

interface UserWithPassword extends User {
    password: string;
}

export const stripPassword = (user: UserWithPassword): User => {
    const { password, ...userBody } = user;
    return userBody;
};
