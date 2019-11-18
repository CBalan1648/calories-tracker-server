import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.model';

@Injectable()
export class UserService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

    async create(user: User): Promise<User> {
        return await new this.userModel(user).save();
    }

    async findAll(): Promise<User[]> {
        return await this.userModel.find().exec();
    }
}
