import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from '../users/user.schema';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jtw.strategy';
import { JWT_SECRET, JWT_EXPIRATION_TIME } from '../config';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: JWT_SECRET,
            signOptions: { expiresIn: JWT_EXPIRATION_TIME },
        }),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],

})
export class AuthModule { }
