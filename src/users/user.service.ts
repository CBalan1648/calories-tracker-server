import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';

@Injectable()
export class UserService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

    async create(user: User): Promise<User> {
        const createdUser = await new this.userModel(user).save();
        const {password, ...userData} = createdUser.toObject();
        return userData;
    }

    async findAll(): Promise<User[]> {
        return await this.userModel.find().exec();
    }
}
