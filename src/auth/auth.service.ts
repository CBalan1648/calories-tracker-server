import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserCredentials } from 'src/users/userCredentials.model';
import { User } from '../users/user.model';

@Injectable()
export class AuthService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>,
                private readonly jwtService: JwtService) { }

    async login(credentials: UserCredentials) {
        const user = await this.findUser(credentials);
        return { access_token: this.jwtService.sign({ user }) };
    }

    async findUser(credentials: UserCredentials) {
        const user = await this.userModel.findOne(credentials, { password: 0, meals: 0 });
        if (user) {
            return user;
        }
        throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
    }
}
