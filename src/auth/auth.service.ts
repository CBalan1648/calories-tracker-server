import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/models/user.model';
import { UserCredentialsDto } from '../users/models/user-credentials.model';
import { USER_NOT_FOUND } from '../helpers/strings';

@Injectable()
export class AuthService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>,
                private readonly jwtService: JwtService) { }

    async login(credentials: UserCredentialsDto) {
        const user = await this.findUser(credentials);
        return { access_token: this.jwtService.sign({ user }) };
    }

    async verifyToken(token: string) {

        this.jwtService.verify(token);
        if (this.jwtService.verify(token)) {
            return { access_token: token };
        }
        throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    async findUser(credentials: UserCredentialsDto) {
        const user = await this.userModel.findOne(credentials, { password: 0, meals: 0 });
        if (user) {
            return user;
        }
        throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
}
