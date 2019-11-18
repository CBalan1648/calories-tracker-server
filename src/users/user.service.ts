import { Model } from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.model';
import { UserCredentials } from './userCredentials.model';

@Injectable()
export class UserService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

    async create(user: User): Promise<User> {
        return await new this.userModel(user).save();
    }

    async loginUser(credentials: UserCredentials) {
        const user = await this.userModel.find(credentials);
        if (user.length > 0) {
            return user;
        }
        throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
    }

    async findAll(): Promise<User[]> {
        return await this.userModel.find().exec();
    }
}
